/**
 * Darcher listen for new txs and start a analyzer for each tx
 */
import {DarcherController, DarcherServer} from "./service";
import {SelectTxControlMsg, TxReceivedMsg} from "./rpc/darcher_controller_service_pb";
import {Analyzer} from "./analyzer";
import {darcherServerPort, logger} from "./common";

export class Darcher {
    private readonly server: DarcherServer;

    private readonly analyzers: { [txHash: string]: Analyzer } = {};

    private readonly darcherController: DarcherController;

    constructor() {
        this.server = new DarcherServer(darcherServerPort);
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
        logger.info("Tx received", "tx", msg.getHash());
        // new tx, initialize analyzer for it
        let analyzer = new Analyzer(msg.getHash());
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