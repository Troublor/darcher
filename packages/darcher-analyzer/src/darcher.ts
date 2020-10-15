/**
 * Darcher listen for new txs and start a analyzer for each tx
 */
import {EthmonitorController, DarcherServer} from "./service";
import {SelectTxControlMsg, TxReceivedMsg, TxState} from "@darcher/rpc";
import {Analyzer} from "./analyzer";
import {Config} from "@darcher/config";
import {Logger, prettifyHash} from "@darcher/helpers";
import {DappTestDriverServiceHandler} from "./service/dappTestDriverService";
import * as path from "path";
import * as fs from "fs";
import {existsSync, mkdirSync} from "fs";
import {$enum} from "ts-enum-util";

export class Darcher {
    private readonly config: Config;
    private readonly logger: Logger;
    private readonly logDir: string;

    private readonly server: DarcherServer;

    private readonly analyzers: { [txHash: string]: Analyzer } = {};

    // ethmonitorControllerService handler
    private readonly ethmonitorController: EthmonitorController;
    // dappTestDriverService handler
    private readonly dappTestDriverHandler: DappTestDriverServiceHandler;

    constructor(logger: Logger, config: Config) {
        this.config = config;
        this.logger = logger;
        this.server = new DarcherServer(this.logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        this.analyzers = {};
        this.ethmonitorController = <EthmonitorController>{
            onTxReceived: this.onTxReceived.bind(this),
            selectTxToTraverse: this.selectTxToTraverse.bind(this),
        }
        this.dappTestDriverHandler = <DappTestDriverServiceHandler>{};
        const now = new Date();
        this.logDir = path.join(
            __dirname, "..", "data",
            `${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        );
        this.logger.info(`Transaction states log will be stored in ${this.logDir}`);
        if (!existsSync(this.logDir)) {
            mkdirSync(this.logDir)
        }
    }

    /**
     * Start the Darcher and returns a promise which resolves when the darcher is started and rejects when error
     */
    public async start(): Promise<void> {
        this.server.ethmonitorControllerService.handler = this.ethmonitorController;
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

    /* darcher controller handlers start */
    private async onTxReceived(msg: TxReceivedMsg): Promise<void> {
        this.logger.debug("Transaction received", {"tx": msg.getHash()});
        // new tx, initialize analyzer for it
        let analyzer = new Analyzer(this.logger, this.config, msg.getHash(), this.server.dbMonitorService);
        // register analyzer's handlers
        this.analyzers[msg.getHash()] = analyzer;
        this.ethmonitorController.onTxTraverseStart = async msg1 => {
            this.logger.info("Transaction traverse started", {"tx": prettifyHash(msg1.getHash())});
            await analyzer.onTxTraverseStart(msg1);
        };
        this.ethmonitorController.onTxFinished = async msg1 => {
            await analyzer.onTxFinished(msg1);
            // save transaction state log
            fs.writeFileSync(
                path.join(this.logDir, `${msg1.getHash()}.json`),
                JSON.stringify(analyzer.log, null, 2),
            );
            this.logger.info(`Transaction log stored in ${msg1.getHash()}.json`)
            this.logger.info("Transaction traverse finished", {"tx": prettifyHash(msg1.getHash())});
        };
        this.ethmonitorController.onTxStateChange = async msg1 => {
            this.logger.debug(
                `Transaction state changed`,
                {
                    tx: prettifyHash(msg1.getHash()),
                    from: $enum(TxState).getKeyOrDefault(msg1.getFrom(), undefined),
                    to: $enum(TxState).getKeyOrDefault(msg1.getTo(), undefined),
                }
            );
            await analyzer.onTxStateChange(msg1);
        };
        this.ethmonitorController.askForNextState = async msg1 => {
            let nextState = await analyzer.askForNextState(msg1);
            this.logger.debug(
                `Decide state transition`,
                {
                    tx: prettifyHash(msg1.getHash()),
                    from: $enum(TxState).getKeyOrDefault(msg1.getCurrentState(), undefined),
                    to: $enum(TxState).getKeyOrDefault(nextState, undefined),
                }
            );
            return nextState;
        };
        this.ethmonitorController.onContractVulnerability = async msg1 => {
            this.logger.debug(`Get contract vulnerability report`, {"vulnerability": msg1.getDescription()});
            await analyzer.onContractVulnerability(msg1);
        };
        this.ethmonitorController.onTxError = async msg1 => {
            this.logger.debug(`Found transaction error`, {"err": msg1.getDescription()});
            await analyzer.onTxError(msg1);
        };
        // register dapp test driver handlers
        this.dappTestDriverHandler.onTestStart = analyzer.onTestStart.bind(analyzer);
        this.dappTestDriverHandler.onTestEnd = analyzer.onTestEnd.bind(analyzer);
        this.dappTestDriverHandler.onConsoleError = analyzer.onConsoleError.bind(analyzer);
        this.dappTestDriverHandler.waitForTxProcess = analyzer.waitForTxProcess.bind(analyzer);
    }

    private async selectTxToTraverse(msg: SelectTxControlMsg): Promise<string> {
        let selected = msg.getCandidateHashesList()[0];
        this.logger.debug(`Transaction selected to traverse`, {"tx": prettifyHash(selected)});
        return selected;
    }

    /* darcher controller handlers end */
}
