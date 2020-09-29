/**
 * Darcher listen for new txs and start a analyzer for each tx
 */
import {EthmonitorController, DarcherServer} from "./service";
import {ContractVulReport, SelectTxControlMsg, TxErrorMsg, TxReceivedMsg, TxState} from "@darcher/rpc";
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
        this.logger.info("Darcher started");
    }

    public async shutdown(): Promise<void> {
        await this.server.shutdown();
        this.logger.info("Darcher shutdown")
    }

    /* darcher controller handlers start */
    private async onTxReceived(msg: TxReceivedMsg): Promise<void> {
        this.logger.info("Tx received", "tx", msg.getHash());
        // new tx, initialize analyzer for it
        let analyzer = new Analyzer(this.logger, this.config, msg.getHash(), this.server.dbMonitorService);
        // register analyzer's handlers
        this.analyzers[msg.getHash()] = analyzer;
        this.ethmonitorController.onTxTraverseStart = analyzer.onTxTraverseStart.bind(analyzer);
        this.ethmonitorController.onTxFinished = async msg1 => {
            await analyzer.onTxFinished.bind(analyzer)(msg1);
            // save transaction state log
            fs.writeFileSync(
                path.join(this.logDir, `${msg.getHash()}.json`),
                JSON.stringify(analyzer.log, null, 2),
            );
        };
        this.ethmonitorController.onTxStateChange = async msg1 => {
            this.logger.debug(`transaction state changed from ${$enum(TxState).getKeyOrDefault(msg1.getFrom(), undefined)} to ${$enum(TxState).getKeyOrDefault(msg1.getTo(), undefined)}`)
            await analyzer.onTxStateChange.bind(analyzer)(msg1);
        };
        this.ethmonitorController.askForNextState = async msg1 => {
            let nextState = await analyzer.askForNextState.bind(analyzer)(msg1);
            this.logger.debug(
                `decide state transition for ${prettifyHash(msg.getHash())} from ${$enum(TxState).getKeyOrDefault(msg1.getCurrentState(), undefined)} to ${$enum(TxState).getKeyOrDefault(nextState, undefined)}`
            )
            return nextState;
        };
        this.ethmonitorController.onContractVulnerability = analyzer.onContractVulnerability.bind(analyzer);
        this.ethmonitorController.onTxError = analyzer.onTxError.bind(analyzer);
        // register dapp test driver handlers
        this.dappTestDriverHandler.onTestStart = analyzer.onTestStart.bind(analyzer);
        this.dappTestDriverHandler.onTestEnd = analyzer.onTestEnd.bind(analyzer);
        this.dappTestDriverHandler.onConsoleError = analyzer.onConsoleError.bind(analyzer);
        this.dappTestDriverHandler.waitForTxProcess = analyzer.waitForTxProcess.bind(analyzer);
    }

    private async selectTxToTraverse(msg: SelectTxControlMsg): Promise<string> {
        let selected = msg.getCandidateHashesList()[0];
        this.logger.debug(`Transaction ${prettifyHash(selected)} selected`);
        return selected;
    }

    /* darcher controller handlers end */
}
