import {IEthmonitorControllerServiceServer} from "@darcher/rpc";
import {sendUnaryData, ServerUnaryCall} from "grpc";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import {
    SelectTxControlMsg,
    TxFinishedMsg,
    TxReceivedMsg,
    TxStateChangeMsg,
    TxStateControlMsg,
    TxTraverseStartMsg
} from "@darcher/rpc";
import {TxState} from "@darcher/rpc";
import {Empty} from "google-protobuf/google/protobuf/empty_pb";
import {Logger} from "@darcher/helpers";

export interface EthmonitorController {
    onTxStateChange: (msg: TxStateChangeMsg) => Promise<void>;
    askForNextState: (msg: TxStateControlMsg) => Promise<TxState>;
    onTxReceived: (msg: TxReceivedMsg) => Promise<void>;
    onTxFinished: (msg: TxFinishedMsg) => Promise<void>;
    onTxTraverseStart: (msg: TxTraverseStartMsg) => Promise<void>;
    selectTxToTraverse: (msg: SelectTxControlMsg) => Promise<string>;
}

export class EthmonitorControllerService implements IEthmonitorControllerServiceServer {
    private readonly logger: Logger;
    private _handler: EthmonitorController = undefined;

    constructor(logger: Logger) {
        this.logger = logger;
        this.logger.info("DarcherControllerService started");
    }

    get handler(): EthmonitorController {
        return this._handler;
    }

    set handler(value: EthmonitorController) {
        this._handler = value;
    }

    askForNextState(call: ServerUnaryCall<TxStateControlMsg>, callback: sendUnaryData<TxStateControlMsg>): void {
        if (this.handler === undefined || !this.handler.askForNextState) {
            let reply = call.request;
            reply.setNextState(TxState.CONFIRMED)
            callback(null, reply);
        } else {
            this.handler.askForNextState(call.request).then(nextState => {
                let reply = call.request;
                reply.setNextState(nextState);
                callback(null, reply);
            });
        }
    }

    notifyTxFinished(call: ServerUnaryCall<TxFinishedMsg>, callback: sendUnaryData<google_protobuf_empty_pb.Empty>): void {
        if (this.handler === undefined || !this.handler.onTxFinished) {
            callback(null, new Empty());
        } else {
            this.handler.onTxFinished(call.request).then(() => {
                callback(null, new Empty());
            });
        }
    }

    notifyTxReceived(call: ServerUnaryCall<TxReceivedMsg>, callback: sendUnaryData<google_protobuf_empty_pb.Empty>): void {
        if (this.handler === undefined || !this.handler.onTxReceived) {
            callback(null, new Empty());
        } else {
            this.handler.onTxReceived(call.request).then(() => {
                callback(null, new Empty());
            });
        }
    }

    notifyTxStateChangeMsg(call: ServerUnaryCall<TxStateChangeMsg>, callback: sendUnaryData<google_protobuf_empty_pb.Empty>): void {
        if (this.handler === undefined || !this.handler.onTxStateChange) {
            callback(null, new Empty());
        } else {
            this.handler.onTxStateChange(call.request).then(() => {
                callback(null, new Empty());
            });
        }
    }

    notifyTxTraverseStart(call: ServerUnaryCall<TxTraverseStartMsg>, callback: sendUnaryData<google_protobuf_empty_pb.Empty>): void {
        if (this.handler === undefined || !this.handler.onTxTraverseStart) {
            callback(null, new Empty());
        } else {
            this.handler.onTxTraverseStart(call.request).then(() => {
                callback(null, new Empty());
            });
        }
    }

    selectTx(call: ServerUnaryCall<SelectTxControlMsg>, callback: sendUnaryData<SelectTxControlMsg>): void {
        if (this.handler === undefined || !this.handler.selectTxToTraverse) {
            let reply = call.request;
            reply.setSelection(reply.getCandidateHashesList()[0])
            callback(null, reply);
        } else {
            this.handler.selectTxToTraverse(call.request).then(select => {
                let reply = call.request;
                reply.setSelection(select)
                callback(null, reply);
            });
        }
    }
}