/**
 * Darcher listen for new txs and start a analyzer for each tx
 */
import {EthmonitorController, DarcherServer} from "./service";
import {ContractVulReport, SelectTxControlMsg, TxErrorMsg, TxReceivedMsg} from "@darcher/rpc";
import {Analyzer} from "./analyzer";
import {Config} from "@darcher/config";
import {Logger} from "@darcher/helpers";

export class Darcher {
    private readonly config: Config;
    private readonly logger: Logger;

    private readonly server: DarcherServer;

    private readonly analyzers: { [txHash: string]: Analyzer } = {};

    private readonly ethmonitorController: EthmonitorController;

    constructor(logger: Logger, config: Config) {
        this.config = config;
        this.logger = logger;
        this.server = new DarcherServer(this.logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        this.analyzers = {};
        this.ethmonitorController = <EthmonitorController>{
            onTxReceived: this.onTxReceived.bind(this),
            selectTxToTraverse: this.selectTxToTraverse.bind(this),
            onContractVulnerability: this.onContractVulnerability.bind(this),
            onTxError: this.onTxError.bind(this),
        }
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
    }

    private async selectTxToTraverse(msg: SelectTxControlMsg): Promise<string> {
        return msg.getCandidateHashesList()[0];
    }

    private async onContractVulnerability(report: ContractVulReport): Promise<void> {

    }

    private async onTxError(txErrorMsg: TxErrorMsg): Promise<void> {

    }

    /* darcher controller handlers end */
}