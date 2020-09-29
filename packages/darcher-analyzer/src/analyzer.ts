import {
    TxState,
    TestStartMsg,
    TestEndMsg,
    ConsoleErrorMsg,
    TxMsg,
    TxErrorMsg,
    ContractVulReport, DBContent
} from "@darcher/rpc";
import {
    TxFinishedMsg,
    TxStateChangeMsg,
    TxStateControlMsg,
    TxTraverseStartMsg
} from "@darcher/rpc";
import {EventEmitter} from "events";
import {$enum} from "ts-enum-util";
import {Config} from "@darcher/config";
import {Logger, prettifyHash} from "@darcher/helpers";
import {DbMonitorService} from "./service/dbmonitorService";
import {Oracle, Report} from "./oracle";

/**
 * Extend TxState to introduce logical tx state (removed, re-executed)
 */
export enum LogicalTxState {
    CREATED,
    PENDING,
    EXECUTED,
    DROPPED,
    CONFIRMED,
    REMOVED,
    REEXECUTED,
}

export function isEqualState(s: TxState, ls: LogicalTxState): boolean {
    if (<number>s === <number>ls) {
        return true;
    }
    return s === TxState.EXECUTED && ls === LogicalTxState.REEXECUTED ||
        s === TxState.PENDING && ls === LogicalTxState.REMOVED;
}

export function toTxState(ls: LogicalTxState): TxState {
    switch (ls) {
        case LogicalTxState.CONFIRMED:
            return TxState.CONFIRMED;
        case LogicalTxState.CREATED:
            return TxState.CREATED;
        case LogicalTxState.DROPPED:
            return TxState.DROPPED;
        case LogicalTxState.EXECUTED:
            return TxState.EXECUTED;
        case LogicalTxState.PENDING:
            return TxState.PENDING;
        case LogicalTxState.REEXECUTED:
            return TxState.EXECUTED;
        case LogicalTxState.REMOVED:
            return TxState.PENDING;
    }
}

/**
 * Analyzer is for each tx, it controls the tx state via grpc with ethmonitor and collect dapp state change data, to generate analyze report
 */
export class Analyzer {
    private readonly config: Config;
    private readonly logger: Logger;
    private txHash: string;
    private txState: LogicalTxState;

    /**
     * A log used for offline analysis
     */
    public readonly log: TransactionLog;

    dbMonitorService: DbMonitorService;

    private stateChangeWaiting: Promise<LogicalTxState>;
    private stateEmitter: EventEmitter;

    // use for analysis
    oracles: Oracle[] = [];
    // txError cache, will be cleaned when forwarded to oracles
    txErrors: TxErrorMsg[] = [];
    // contractVulnerability cache, will be cleaned when forwarded to oracles
    contractVulReports: ContractVulReport[] = [];
    // consoleError cache, will be cleaned when forwarded to oracles
    consoleErrors: ConsoleErrorMsg[] = [];

    constructor(logger: Logger, config: Config, txHash: string, dbmonitorService: DbMonitorService) {
        this.config = config;
        this.logger = logger;
        this.txHash = txHash;
        this.dbMonitorService = dbmonitorService;
        this.txState = LogicalTxState.CREATED;
        this.stateEmitter = new EventEmitter();
        this.stateChangeWaiting = Promise.resolve(LogicalTxState.CREATED);
        this.log = <TransactionLog>{
            hash: txHash,
            states: {
                [LogicalTxState.CREATED]: null,
                [LogicalTxState.PENDING]: null,
                [LogicalTxState.EXECUTED]: null,
                [LogicalTxState.REMOVED]: null,
                [LogicalTxState.REEXECUTED]: null,
                [LogicalTxState.CONFIRMED]: null,
                [LogicalTxState.DROPPED]: null,
            }
        }
    }

    /* darcher controller handlers start */
    public async onTxStateChange(msg: TxStateChangeMsg): Promise<void> {
        this.logger.info("Tx state changed", "from", $enum(TxState).getKeyOrThrow(msg.getFrom()), "to", $enum(TxState).getKeyOrThrow(msg.getTo()));
        if (msg.getFrom() === TxState.EXECUTED &&
            msg.getTo() === TxState.PENDING &&
            this.txState === LogicalTxState.EXECUTED) {
            // remove
            this.txState = LogicalTxState.REMOVED;
        } else if (this.txState === LogicalTxState.REMOVED &&
            msg.getFrom() === TxState.PENDING &&
            msg.getTo() === TxState.EXECUTED) {
            // re-execute
            this.txState = LogicalTxState.REEXECUTED;
        } else if (!isEqualState(msg.getFrom(), this.txState)) {
            this.logger.warn("Tx state inconsistent,", "expect", $enum(LogicalTxState).getKeyOrThrow(this.txState), "got", $enum(TxState).getKeyOrThrow(msg.getFrom()));
            this.txState = <LogicalTxState>(msg.getTo() as number);
        } else {
            this.txState = <LogicalTxState>(msg.getTo() as number);
        }
        // apply oracles, this may block for a while
        await this.applyOracles(this.txState);
        this.stateEmitter.emit($enum(LogicalTxState).getKeyOrThrow(this.txState), this.txState);
    }

    public async onTxTraverseStart(msg: TxTraverseStartMsg): Promise<void> {
        this.logger.info("Tx traverse started", "tx", prettifyHash(msg.getHash()));
    }

    public async onTxFinished(msg: TxFinishedMsg): Promise<void> {
        this.logger.info("Tx traverse finished", "tx", prettifyHash(msg.getHash()));
    }

    public async askForNextState(msg: TxStateControlMsg): Promise<TxState> {
        // before tell ethmonitor next state, make sure previous state has been reached
        await this.stateChangeWaiting;
        if (this.txState === LogicalTxState.CREATED) {
            this.stateChangeWaiting = new Promise<LogicalTxState>(resolve => {
                this.stateEmitter.once($enum(LogicalTxState).getKeyOrThrow(LogicalTxState.PENDING), resolve)
            });
            return TxState.PENDING;
        } else if (this.txState === LogicalTxState.PENDING) {
            this.stateChangeWaiting = new Promise<LogicalTxState>(resolve => {
                this.stateEmitter.once($enum(LogicalTxState).getKeyOrThrow(LogicalTxState.EXECUTED), resolve)
            });
            return TxState.EXECUTED;
        } else if (this.txState === LogicalTxState.EXECUTED) {
            this.stateChangeWaiting = new Promise<LogicalTxState>(resolve => {
                this.stateEmitter.once($enum(LogicalTxState).getKeyOrThrow(LogicalTxState.REMOVED), resolve)
            });
            return TxState.PENDING;
        } else if (this.txState === LogicalTxState.REMOVED) {
            this.stateChangeWaiting = new Promise<LogicalTxState>(resolve => {
                this.stateEmitter.once($enum(LogicalTxState).getKeyOrThrow(LogicalTxState.REEXECUTED), resolve)
            });
            return TxState.EXECUTED;
        } else if (this.txState === LogicalTxState.REEXECUTED) {
            this.stateChangeWaiting = new Promise<LogicalTxState>(resolve => {
                this.stateEmitter.once($enum(LogicalTxState).getKeyOrThrow(LogicalTxState.CONFIRMED), resolve)
            });
            return TxState.CONFIRMED
        } else if (this.txState === LogicalTxState.CONFIRMED) {
            this.stateChangeWaiting = Promise.resolve(LogicalTxState.CONFIRMED);
            return TxState.CONFIRMED;
        } else if (this.txState === LogicalTxState.DROPPED) {
            this.stateChangeWaiting = Promise.resolve(LogicalTxState.DROPPED);
            return TxState.DROPPED;
        }
    }

    public async onTxError(msg: TxErrorMsg): Promise<void> {
        this.txErrors.push(msg);
    }

    public async onContractVulnerability(msg: ContractVulReport): Promise<void> {
        this.contractVulReports.push(msg);
    }

    /* darcher controller handlers end */

    /* dappTestDriverService handlers start */
    public async onTestStart(msg: TestStartMsg): Promise<void> {

    }

    public async onTestEnd(msg: TestEndMsg): Promise<void> {

    }

    public async onConsoleError(msg: ConsoleErrorMsg): Promise<void> {
        this.consoleErrors.push(msg);
    }

    /**
     * This method will be called through grpc by dapp test driver and will cause dapp test driver pause.
     *
     * This method will wait until the whole tx lifecycle traverse is finished and then resolve the promise.
     * @param msg
     */
    public async waitForTxProcess(msg: TxMsg): Promise<void> {
        return new Promise(resolve => {
            // only resolve the promise when stateEmitter has emitted LogicalTxState.CONFIRMED
            // at this time tx lifecycle traverse should finished
            this.stateEmitter.once($enum(LogicalTxState).getKeyOrThrow(LogicalTxState.CONFIRMED), resolve);
            this.stateEmitter.once($enum(LogicalTxState).getKeyOrThrow(LogicalTxState.DROPPED), resolve);
        });
    }

    /* dappTestDriverService handlers end */


    /**
     * Call each oracle's onTxState method, forwarding current txState, dbContent, txErrors, contractVulReports and consoleErrors
     * to each oracle and clean txErrors, contractVulReports, consoleErrors
     *
     * This method will first wait for a time limit for dapp to handle transaction state change.
     * @param txState The state that transaction is at currently
     */
    private async applyOracles(txState: LogicalTxState): Promise<void> {
        // the time limit (milliseconds) for dapp to handle tx state change
        const timeLimit = 10000;
        return new Promise(async resolve => {
            try {
                await this.dbMonitorService.refreshPage(this.config.dbMonitor.dbAddress);
            } catch (e){
                this.logger.error(e);
            }
            setTimeout(async () => {
                // call dbMonitor service to get dbContent
                try {
                    let dbContent = await this.dbMonitorService.getAllData(this.config.dbMonitor.dbAddress, this.config.dbMonitor.dbName);
                    // forward to each oracle
                    for (let oracle of this.oracles) {
                        oracle.onTxState(txState, dbContent, this.txErrors, this.contractVulReports, this.consoleErrors);
                    }
                    this.log.states[txState] = dbContent.toObject();
                } catch (e) {
                    this.logger.error(e);
                }
                // clean txErrors, contractVulReports, consoleErrors, because they are cache for only one tx state
                this.txErrors = [];
                this.contractVulReports = [];
                this.consoleErrors = [];

                resolve();
            }, timeLimit);
        })
    }

    /**
     * Get bug reports of all oracles, if there is no bug, an empty array will be returned
     */
    public getBugReports(): Report[] {
        let reports: Report[] = [];
        for (let oracle of this.oracles) {
            reports.push(...oracle.getBugReports());
        }
        return reports;
    }
}

/**
 * This class records database changes in each state of transaction
 */
export interface TransactionLog {
    hash: string,
    states: {
        [LogicalTxState.CREATED]: object | null,
        [LogicalTxState.PENDING]: object | null,
        [LogicalTxState.EXECUTED]: object | null,
        [LogicalTxState.REMOVED]: object | null,
        [LogicalTxState.REEXECUTED]: object | null,
        [LogicalTxState.CONFIRMED]: object | null,
        [LogicalTxState.DROPPED]: object | null,
    }
}
