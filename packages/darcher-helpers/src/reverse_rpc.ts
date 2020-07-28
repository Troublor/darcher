import {Role} from "@darcher/rpc";

export type ReverseRPCHandler<ReqT, RespT> = (req: ReqT) => Promise<RespT>;

import * as grpc from "grpc";
import {EventEmitter} from "events";

export interface Identifiable {
    getRole(): Role;

    getId(): string;
}

/**
 * Reverse RPC server over grpc bidirectional stream.
 * This is actually the grpc client but acts logically as reverse RPC server.
 */
export class ReverseRPCServer<ReqT extends Identifiable, RespT extends Identifiable> {

    private stream: grpc.ClientDuplexStream<RespT, ReqT>

    constructor(stream: grpc.ClientDuplexStream<RespT, ReqT>) {
        this.stream = stream;
    }

    /**
     * Serve will do serve the reverse rpc using the handler provide.
     * This method will returns a promise which resolves when the stream on which reverse rpc works closes
     * and rejects when the stream gives any error.
     * @param handler
     */
    public async serve(handler: ReverseRPCHandler<ReqT, RespT>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.stream.on("error", reject);
            this.stream.on("close", resolve);
            this.stream.on("data", async data => {
                // pass request to handler
                let resp = await handler(data);
                this.stream.write(resp);
            });
        })
    }

    /**
     * close the reverse rpc service
     */
    public async close(): Promise<void> {
        this.stream.cancel();
    }
}

/**
 * Reverse RPC server over grpc bidirectional stream.
 * This is actually the grpc server but acts logically as reverse RPC client.
 */
export class ReverseRPCClient<ReqT extends Identifiable, RespT extends Identifiable> {

    private stream: grpc.ServerDuplexStream<ReqT, RespT>;
    private emitter: EventEmitter;
    private _established: boolean;

    get established(): boolean {
        return this._established;
    }

    constructor() {
        this.emitter = new EventEmitter();
        this._established = false;
    }

    public establish(stream: grpc.ServerDuplexStream<ReqT, RespT>) {
        this.emitter.emit("establish");
        this._established = true;
        this.stream = stream;
    }

    public waitForEstablishment(): Promise<void> {
        return new Promise<void>(resolve => {
            this.emitter.once("establish", resolve);
            if (this.stream) {
                this.emitter.removeListener("establish", resolve);
                resolve();
            }
        })
    }

    /**
     * Call the reverse rpc, this will return a promise which resolves when the rpc returns, and rejects when error
     * @param request
     */
    public async call(request: ReqT): Promise<RespT> {
        return new Promise((resolve, reject) => {
            this.stream.on("error", reject);
            this.stream.on("data", async (data: RespT) => {
                if (data.getId() === request.getId()) {
                    // resolve the promise
                    resolve(data);
                }
            });
            this.stream.write(request);
        });
    }

    public async close(): Promise<void> {
        return Promise.resolve();
    }
}
