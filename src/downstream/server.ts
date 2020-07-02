import {Server as JaysonServer, Method as JaysonMethod, Client} from "jayson";
import {
    DAppStateChangeMsg,
    logger,
    PivotReachedMsg, SelectTxToTraverseMsg, SelectTxToTraverseReply,
    TxFinishedMsg,
    TxReceivedMsg, TxStartMsg,
    TxStateChangeMsg
} from "../common";
import {EventEmitter} from "events";
import {genEmptyReply} from "../common";

export enum EventNames {
    DAppStateChange = "DAppStateChange"
}

export interface EthMonitorController {
    onTxStateChange: (msg: TxStateChangeMsg) => void;
    onPivotReached: (msg: PivotReachedMsg) => void;
    onTxReceived: (msg: TxReceivedMsg) => void;
    onTxFinished: (msg: TxFinishedMsg) => void;
    onTxStart: (msg: TxStartMsg) => void;
    selectTxToTraverse: (msg: SelectTxToTraverseMsg) => string;
}

export class Server extends EventEmitter {
    private jaysonServer: JaysonServer;

    constructor(controller: EthMonitorController) {
        super();
        let self = this;
        this.jaysonServer = new JaysonServer({
            notifyDAppStateChangeRPC: function (msg: DAppStateChangeMsg, done: any) {
                self.emit(EventNames.DAppStateChange, msg);
                done(null, genEmptyReply());
            },
            TxStateChangeRPC: async (msg: TxStateChangeMsg, done: any) => {
                await controller.onTxStateChange(msg);
                done(null, genEmptyReply());
            },
            TxReceivedRPC: async (msg: TxReceivedMsg, done: any) => {
                await controller.onTxReceived(msg);
                done(null, genEmptyReply());
            },
            TxFinishedRPC: async (msg: TxFinishedMsg, done: any) => {
                await controller.onTxFinished(msg);
                done(null, genEmptyReply());
            },
            TxStartRPC: async (msg: TxStartMsg, done: any) => {
                await controller.onTxStart(msg);
                done(null, genEmptyReply());
            },
            PivotReachedRPC: async (msg: PivotReachedMsg, done: any) => {
                await controller.onPivotReached(msg);
                done(null, genEmptyReply());
            },
            SelectTxToTraverseRPC: async (msg: SelectTxToTraverseMsg, done: any) => {
                let hash = await controller.selectTxToTraverse(msg);
                done(null, <SelectTxToTraverseReply>{
                    Hash: hash,
                    Err: null
                });
            }
        });
    }

    public start(port: number) {
        this.jaysonServer.http().listen(port);
        logger.info("jayson server started at port", port);
    }
}
