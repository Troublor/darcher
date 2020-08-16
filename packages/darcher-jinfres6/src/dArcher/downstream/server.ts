import {Reply, TestMsg, TxReceivedMsg, TxStateChangeMsg, TxFinishedMsg, Msg, PivotReachedMsg} from "../common";

import jayson from "jayson";

export type RpcHandler<M extends Msg, R extends Reply> = (msg: M) => Promise<R>;

export interface HandlerSet {
    TxStateChangeHandler: RpcHandler<TxStateChangeMsg, Reply>,
    TxReceivedHandler: RpcHandler<TxReceivedMsg, Reply>,
    TxFinishedHandler: RpcHandler<TxFinishedMsg, Reply>,
    PivotReachedHandler: RpcHandler<PivotReachedMsg, Reply>,
    TestHandler: RpcHandler<TestMsg, Reply>
}

export default function startServer(handlers: HandlerSet) {
    // create a server
    const server = new jayson.Server({
        HelloRPC: new jayson.Method(function (msg: TestMsg, done: any) {
            if (!handlers.TestHandler) {
                done(null, <Reply>{Err: null});
            }
            handlers.TestHandler(msg).then(reply => {
                done(null, reply);
            }).catch(e => {
                done(e, null);
            });
        }),

        TxStateChangeRPC: new jayson.Method((msg: TxStateChangeMsg, done: any) => {
            if (!handlers.TxStateChangeHandler) {
                done(null, <Reply>{Err: null});
            }
            handlers.TxStateChangeHandler(msg).then(reply => {
                done(null, reply);
            }).catch(e => {
                done(e, <Reply>{Err: e})
            });
        }),

        TxReceivedRPC: new jayson.Method((msg: TxReceivedMsg, done: any) => {
            if (!handlers.TxReceivedHandler) {
                done(null, <Reply>{
                    Err: null
                });
            }
            handlers.TxReceivedHandler(msg).then(reply => {
                done(null, reply);
            }).catch(e => {
                done(e, <Reply>{Err: e})
            });
        }),

        TxFinishedRPC: new jayson.Method((msg: TxFinishedMsg, done: any) => {
            if (!handlers.TxFinishedHandler) {
                done(null, <Reply>{
                    Err: null
                });
            }
            handlers.TxFinishedHandler(msg).then(reply => {
                done(null, reply);
            }).catch(e => {
                done(e, <Reply>{Err: e});
            });
        }),

        PivotReachedRPC: new jayson.Method((msg: PivotReachedMsg, done: any) => {
            if (!handlers.PivotReachedHandler) {
                done(null, <Reply>{
                    Err: null
                });
            }
            handlers.PivotReachedHandler(msg).then(reply => {
                done(null, reply);
            }).catch(e => {
                done(e, <Reply>{Err: e});
            });
        }),
    });
    server.http().listen(1236);
    console.log("JSON RPC Server started at port 1236");
}
