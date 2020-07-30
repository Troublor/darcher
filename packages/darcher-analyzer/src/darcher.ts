/**
 * Darcher listen for new txs and start a analyzer for each tx
 */
import {EthmonitorController, DarcherServer} from "./service";
import {ContractVulReport, SelectTxControlMsg, TxErrorMsg, TxReceivedMsg} from "@darcher/rpc";
import {Analyzer} from "./analyzer";
import {Config} from "@darcher/config";
import {Logger} from "@darcher/helpers";
import {DappTestDriverServiceHandler} from "./service/dappTestDriverService";

export class Darcher {
    private readonly config: Config;
    private readonly logger: Logger;

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
    }

    /**
     * Start the Darcher and returns a promise which resolves when the darcher is started and rejects when error
     */
    public async start(): Promise<void> {
        this.server.ethmonitorControllerService.handler = this.ethmonitorController;
        return this.server.start();
    }

    public async shutdown(): Promise<void> {
        return this.server.shutdown();
    }

    /* darcher controller handlers start */
    private async onTxReceived(msg: TxReceivedMsg): Promise<void> {
        this.logger.info("Tx received", "tx", msg.getHash());
        // new tx, initialize analyzer for it
        let analyzer = new Analyzer(this.logger, this.config, msg.getHash(), this.server.dbMonitorService);
        // register analyzer's handlers
        this.analyzers[msg.getHash()] = analyzer;
        this.ethmonitorController.onTxTraverseStart = analyzer.onTxTraverseStart.bind(analyzer);
        this.ethmonitorController.onTxFinished = analyzer.onTxFinished.bind(analyzer);
        this.ethmonitorController.onTxStateChange = analyzer.onTxStateChange.bind(analyzer);
        this.ethmonitorController.askForNextState = analyzer.askForNextState.bind(analyzer);
        this.ethmonitorController.onContractVulnerability = analyzer.onContractVulnerability.bind(analyzer);
        this.ethmonitorController.onTxError = analyzer.onTxError.bind(analyzer);
        // register dapp test driver handlers
        this.dappTestDriverHandler.onTestStart = analyzer.onTestStart.bind(analyzer);
        this.dappTestDriverHandler.onTestEnd = analyzer.onTestEnd.bind(analyzer);
        this.dappTestDriverHandler.onConsoleError = analyzer.onConsoleError.bind(analyzer);
        this.dappTestDriverHandler.waitForTxProcess = analyzer.waitForTxProcess.bind(analyzer);
    }

    private async selectTxToTraverse(msg: SelectTxControlMsg): Promise<string> {
        return msg.getCandidateHashesList()[0];
    }

    /* darcher controller handlers end */
}