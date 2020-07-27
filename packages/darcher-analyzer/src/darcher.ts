/**
 * Darcher listen for new txs and start a analyzer for each tx
 */
import {DarcherController, DarcherServer} from "./service";
import {SelectTxControlMsg, TxReceivedMsg} from "@darcher/rpc";
import {Analyzer} from "./analyzer";
import {Config} from "@darcher/config";
import {Logger} from "@darcher/helpers";

export class Darcher {
    private readonly config: Config;
    private readonly logger: Logger;

    private readonly server: DarcherServer;

    private readonly analyzers: { [txHash: string]: Analyzer } = {};

    private readonly darcherController: DarcherController;

    constructor(logger: Logger, config: Config) {
        this.config = config;
        this.logger = logger;
        this.server = new DarcherServer(config.analyzer.grpcPort, config.analyzer.wsPort);
        this.analyzers = {};
        this.darcherController = <DarcherController>{
            onTxReceived: this.onTxReceived.bind(this),
            selectTxToTraverse: this.selectTxToTraverse.bind(this),
        }
    }

    public start() {
        this.server.darcherControllerService.handler = this.darcherController;
        this.server.start();
    }

    /* darcher controller handlers start */
    private async onTxReceived(msg: TxReceivedMsg): Promise<void> {
        this.logger.info("Tx received", "tx", msg.getHash());
        // new tx, initialize analyzer for it
        let analyzer = new Analyzer(this.logger, this.config, msg.getHash(), this.server.dbMonitorService);
        // register analyzer's handlers
        this.analyzers[msg.getHash()] = analyzer;
        this.darcherController.onTxTraverseStart = analyzer.onTxTraverseStart.bind(analyzer);
        this.darcherController.onTxFinished = analyzer.onTxFinished.bind(analyzer);
        this.darcherController.onTxStateChange = analyzer.onTxStateChange.bind(analyzer);
        this.darcherController.askForNextState = analyzer.askForNextState.bind(analyzer);
    }

    private async selectTxToTraverse(msg: SelectTxControlMsg): Promise<string> {
        return msg.getCandidateHashesList()[0];
    }

    /* darcher controller handlers end */


}