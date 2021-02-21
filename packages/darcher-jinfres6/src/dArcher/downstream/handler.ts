import {Msg, PivotReachedMsg, Reply, TestMsg, TxFinishedMsg, TxReceivedMsg, TxStateChangeMsg} from "../common";

const readline = require("readline");

export type RpcHandler<M extends Msg, R extends Reply> = (msg: M) => Promise<R>;

export interface HandlerSet {
    TxStateChangeHandler: RpcHandler<TxStateChangeMsg, Reply>,
    TxReceivedHandler: RpcHandler<TxReceivedMsg, Reply>,
    TxFinishedHandler: RpcHandler<TxFinishedMsg, Reply>,
    PivotReachedHandler: RpcHandler<PivotReachedMsg, Reply>,
    TestHandler: RpcHandler<TestMsg, Reply>
}

export default class ServerHandler implements HandlerSet {
    TestHandler(msg: TestMsg): Promise<Reply> {
        return Promise.resolve(undefined);
    }

    PivotReachedHandler(msg: PivotReachedMsg): Promise<Reply> {
        readline();
        return Promise.resolve({Err: null});
    }

    TxFinishedHandler(msg: TxFinishedMsg): Promise<Reply> {
        return Promise.resolve(undefined);
    }

    TxReceivedHandler(msg: TxReceivedMsg): Promise<Reply> {
        return Promise.resolve(undefined);
    }

    TxStateChangeHandler(msg: TxStateChangeMsg): Promise<Reply> {
        return Promise.resolve(undefined);
    }

}