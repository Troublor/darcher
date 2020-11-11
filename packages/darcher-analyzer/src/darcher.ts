/**
 * Darcher listen for new txs and start a analyzer for each tx
 */
import {DarcherServer, EthmonitorController} from "./service";
import {
    ContractVulReport,
    SelectTxControlMsg, TxErrorMsg,
    TxFinishedMsg,
    TxReceivedMsg,
    TxState,
    TxStateChangeMsg,
    TxStateControlMsg,
    TxTraverseStartMsg
} from "@darcher/rpc";
import {Analyzer} from "./analyzer";
import {Config} from "@darcher/config";
import {Logger, prettifyHash} from "@darcher/helpers";
import {DappTestDriverServiceHandler} from "./service/dappTestDriverService";
import * as path from "path";
import * as fs from "fs";
import {existsSync, mkdirSync} from "fs";
import {$enum} from "ts-enum-util";
import TraceStore from "@darcher/trace/store";
import {SendTransactionTrace} from "@darcher/trace/instrument";

export class Darcher {
    private readonly config: Config;
    private readonly logger: Logger;
    private readonly logDir: string;

    private readonly server: DarcherServer;
    private readonly traceStore: TraceStore;

    private readonly analyzers: { [txHash: string]: Analyzer } = {};
    private currentAnalyzer: Analyzer | null;

    // ethmonitorControllerService handler
    private readonly ethmonitorController: EthmonitorController;
    // dappTestDriverService handler
    private readonly dappTestDriverHandler: DappTestDriverServiceHandler;

    constructor(logger: Logger, config: Config) {
        this.config = config;
        this.logger = logger;
        this.traceStore = new TraceStore(1236, this.logger, undefined, this.onTxTrace.bind(this));
        this.server = new DarcherServer(this.logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        this.analyzers = {};
        this.currentAnalyzer = null;
        this.ethmonitorController = <EthmonitorController>{
            onTxReceived: this.onTxReceived.bind(this),
            selectTxToTraverse: this.selectTxToTraverse.bind(this),
            onTxStateChange: this.onTxStateChange.bind(this),
            onTxFinished: this.onTxFinished.bind(this),
            onTxTraverseStart: this.onTxTraverseStart.bind(this),
            askForNextState: this.askForNextState.bind(this),
            onContractVulnerability: this.onContractVulnerability.bind(this),
            onTxError: this.onTxError.bind(this),
        }
        this.dappTestDriverHandler = <DappTestDriverServiceHandler>{};
        const now = new Date();
        if (config.logDir) {
            this.logDir = config.logDir;
        } else {
            this.logDir = path.join(
                __dirname, "..", "data",
                `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
            );
        }
        this.logger.info(`Transaction states log will be stored in ${this.logDir}`);
        if (!existsSync(this.logDir)) {
            mkdirSync(this.logDir, {recursive: true})
        }
    }

    /**
     * Start the Darcher and returns a promise which resolves when the darcher is started and rejects when error
     */
    public async start(): Promise<void> {
        this.server.ethmonitorControllerService.handler = this.ethmonitorController;
        this.server.dappTestDriverService.handler = this.dappTestDriverHandler;
        await this.server.start();
        this.logger.info("Darcher started", {
            grpcPort: this.config.analyzer.grpcPort,
            wsPort: this.config.analyzer.wsPort,
        });
    }

    public async shutdown(): Promise<void> {
        await this.server.shutdown();
        this.logger.info("Darcher shutdown")
    }

    private async onTxTrace(trace: SendTransactionTrace) {
        if (this.analyzers[trace.hash]) {
            this.analyzers[trace.hash].log.stack = trace.stack;
        }
    }

    /* darcher controller handlers start */
    private async onTxReceived(msg: TxReceivedMsg): Promise<void> {
        this.logger.debug("Transaction received", {"tx": msg.getHash()});
        // new tx, initialize analyzer for it
        this.analyzers[msg.getHash()] = new Analyzer(this.logger, this.config, msg.getHash(), this.server.dbMonitorService);
    }

    private async onTxStateChange(msg: TxStateChangeMsg) {
        if (msg.getHash() in this.analyzers) {
            this.logger.debug(
                `Transaction state changed`,
                {
                    tx: prettifyHash(msg.getHash()),
                    from: $enum(TxState).getKeyOrDefault(msg.getFrom(), undefined),
                    to: $enum(TxState).getKeyOrDefault(msg.getTo(), undefined),
                }
            );
            await this.analyzers[msg.getHash()].onTxStateChange(msg);
        } else {
            this.logger.warn(
                `Unknown transaction state changed`,
                {
                    tx: prettifyHash(msg.getHash()),
                    from: $enum(TxState).getKeyOrDefault(msg.getFrom(), undefined),
                    to: $enum(TxState).getKeyOrDefault(msg.getTo(), undefined),
                }
            );
        }
    };

    private async onTxFinished(msg: TxFinishedMsg) {
        if (msg.getHash() in this.analyzers) {
            await this.analyzers[msg.getHash()].onTxFinished(msg);
            this.currentAnalyzer = null;
            // save transaction state log
            fs.writeFileSync(
                path.join(this.logDir, `${msg.getHash()}.json`),
                JSON.stringify(this.analyzers[msg.getHash()].log, null, 2),
            );
            this.logger.info(`Transaction log stored in ${msg.getHash()}.json`)
            this.logger.info("Transaction traverse finished", {"tx": prettifyHash(msg.getHash())});
        } else {
            this.logger.warn("Unknown transaction traverse finished", {"tx": prettifyHash(msg.getHash())});
        }
    }

    private async selectTxToTraverse(msg: SelectTxControlMsg): Promise<string> {
        if (this.currentAnalyzer) {
            if (msg.getCandidateHashesList().includes(this.currentAnalyzer.txHash)) {
                this.logger.debug(`Transaction selected to traverse`, {"tx": prettifyHash(this.currentAnalyzer.txHash)});
                return this.currentAnalyzer.txHash;
            } else {
                this.logger.warn("Transaction lost", {
                    tx: this.currentAnalyzer.txHash,
                });
                let selected = msg.getCandidateHashesList()[0];
                this.logger.debug(`Transaction selected to traverse`, {"tx": prettifyHash(selected)});
                return selected;
            }
        } else {
            // no current analyzer, select from pending analyzers
            for (const tx in this.analyzers) {
                if (!this.analyzers[tx].finished && msg.getCandidateHashesList().includes(tx)) {
                    this.logger.debug(`Transaction selected to traverse`, {"tx": prettifyHash(tx)});
                    this.loadAnalyzer(this.analyzers[tx]);
                    return tx;
                }
            }
            let selected = msg.getCandidateHashesList()[0];
            this.logger.warn("No active analyzers but need to select tx");
            this.logger.debug(`Transaction selected to traverse`, {"tx": prettifyHash(selected)});
            return selected;
        }
    }

    private async onTxTraverseStart(msg: TxTraverseStartMsg) {
        if (msg.getHash() in this.analyzers) {
            this.logger.info("Transaction traverse started", {"tx": prettifyHash(msg.getHash())});
            await this.analyzers[msg.getHash()].onTxTraverseStart(msg);
        } else {
            this.logger.warn("Unknown transaction traverse started", {"tx": prettifyHash(msg.getHash())});
        }
    }

    private async askForNextState(msg: TxStateControlMsg): Promise<TxState> {
        if (msg.getHash() in this.analyzers) {
            let nextState = await this.analyzers[msg.getHash()].askForNextState(msg);
            this.logger.debug(
                `Decide state transition`,
                {
                    tx: prettifyHash(msg.getHash()),
                    from: $enum(TxState).getKeyOrDefault(msg.getCurrentState(), undefined),
                    to: $enum(TxState).getKeyOrDefault(nextState, undefined),
                }
            );
            return nextState;
        } else {
            this.logger.warn(
                `Decide state transition for unknown transaction`,
                {
                    tx: prettifyHash(msg.getHash()),
                    from: $enum(TxState).getKeyOrDefault(msg.getCurrentState(), undefined),
                    to: $enum(TxState).getKeyOrDefault(TxState.CONFIRMED, undefined),
                }
            );
            return TxState.CONFIRMED;
        }
    }

    private async onContractVulnerability(msg: ContractVulReport) {
        if (msg.getTxHash() in this.analyzers) {
            this.logger.debug(`Get contract vulnerability report`, {"vulnerability": msg.getDescription()});
            await this.analyzers[msg.getTxHash()].onContractVulnerability(msg);
        } else {
            this.logger.warn(`Get contract vulnerability report for unknown transaction`, {"vulnerability": msg.getDescription()});
        }
    }

    private async onTxError(msg: TxErrorMsg) {
        if (msg.getHash() in this.analyzers) {
            this.logger.debug(`Found transaction error`, {"err": msg.getDescription()});
            await this.analyzers[msg.getHash()].onTxError(msg);
        } else {
            this.logger.warn(`Found unknown transaction error`, {"err": msg.getDescription()});
        }
    }

    private loadAnalyzer(analyzer: Analyzer) {
        // register dapp test driver handlers
        this.dappTestDriverHandler.onTestStart = analyzer.onTestStart.bind(analyzer);
        this.dappTestDriverHandler.onTestEnd = analyzer.onTestEnd.bind(analyzer);
        this.dappTestDriverHandler.onConsoleError = analyzer.onConsoleError.bind(analyzer);
        this.dappTestDriverHandler.waitForTxProcess = async msg1 => {
            this.logger.debug(
                `DApp waiting for Transaction process`,
                {
                    tx: prettifyHash(msg1.getHash()),
                }
            );
            await analyzer.waitForTxProcess(msg1);
            this.logger.debug(
                `Transaction process complete, resume DApp`,
                {
                    tx: prettifyHash(msg1.getHash()),
                }
            );
        };
    }

    /* darcher controller handlers end */
}
