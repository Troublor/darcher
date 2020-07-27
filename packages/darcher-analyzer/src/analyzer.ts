import {TxState, Error as rpcError} from "@darcher/rpc";
import {
    TxFinishedMsg,
    TxStateChangeMsg,
    TxStateControlMsg,
    TxTraverseStartMsg
} from "@darcher/rpc";
import {logger, prettifyHash} from "./common";
import {EventEmitter} from "events";
import {$enum} from "ts-enum-util";
import {DBMonitorService} from "./service/dbmonitorService";
import {Config} from "@darcher/config";
import {Logger} from "@darcher/helpers";

/**
 * Extend TxState to introduce logical tx state (reverted, re-executed)
 */
export enum LogicalTxState {
    CREATED,
    PENDING,
    EXECUTED,
    DROPPED,
    CONFIRMED,
    REVERTED,
    REEXECUTED,
}

export function isEqualState(s: TxState, ls: LogicalTxState): boolean {
    if (<number>s === <number>ls) {
        return true;
    }
    return s === TxState.EXECUTED && ls === LogicalTxState.REEXECUTED ||
        s === TxState.PENDING && ls === LogicalTxState.REVERTED;
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
        case LogicalTxState.REVERTED:
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

    dbMonitorService: DBMonitorService;

    private stateChangeWaiting: Promise<LogicalTxState>;
    private stateEmitter: EventEmitter

    constructor(logger: Logger, config: Config, txHash: string, dbmonitorService: DBMonitorService) {
        this.config = config;
        this.logger = logger;
        this.txHash = txHash;
        this.dbMonitorService = dbmonitorService;
        this.txState = LogicalTxState.CREATED;
        this.stateEmitter = new EventEmitter();
        this.stateChangeWaiting = Promise.resolve(LogicalTxState.CREATED);
    }

    /* darcher controller handlers start */
    public async onTxStateChange(msg: TxStateChangeMsg): Promise<void> {
        this.logger.info("Tx state changed", "from", $enum(TxState).getKeyOrThrow(msg.getFrom()), "to", $enum(TxState).getKeyOrThrow(msg.getTo()));
        if (msg.getFrom() === TxState.EXECUTED &&
            msg.getTo() === TxState.PENDING &&
            this.txState === LogicalTxState.EXECUTED) {
            // revert
            this.txState = LogicalTxState.REVERTED;
        } else if (this.txState === LogicalTxState.REVERTED &&
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
        this.logger.info("Wait for 10000 ms")
        await this.dbMonitorService.refreshPage(this.config.dbMonitor.dbAddress);
        setTimeout(async () => {
            try {
                let data = await this.dbMonitorService.getAllData(this.config.dbMonitor.dbAddress, this.config.dbMonitor.dbName);
                let iter = data.getTablesMap().keys();
                let key = iter.next();
                while (!key.done) {
                    let table = data.getTablesMap().get(key.value);
                    console.log("table:", key.value);
                    console.log("keyPath", table.getKeypathList().toString());
                    console.log("content", table.getEntriesList().toString());
                    key = iter.next();
                }
            } catch (e) {
                this.logger.error("Get all data error", $enum(rpcError).getKeyOrDefault(e, e));
            }
            this.stateEmitter.emit($enum(LogicalTxState).getKeyOrThrow(this.txState), this.txState);
        }, 10000);
    }

    public async onTxTraverseStart(msg: TxTraverseStartMsg): Promise<void> {
        this.logger.info("Tx traverse started", "tx", prettifyHash(msg.getHash()));
    }

    public async onTxFinished(msg: TxFinishedMsg): Promise<void> {
        this.logger.info("Tx traverse finished", "tx", prettifyHash(msg.getHash()));
    }

    public async askForNextState(msg: TxStateControlMsg): Promise<TxState> {
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
                this.stateEmitter.once($enum(LogicalTxState).getKeyOrThrow(LogicalTxState.REVERTED), resolve)
            });
            return TxState.PENDING;
        } else if (this.txState === LogicalTxState.REVERTED) {
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

    /* darcher controller handlers end */
}