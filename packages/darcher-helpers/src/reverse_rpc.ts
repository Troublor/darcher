import {Role} from "@darcher/rpc";
import * as grpc from "grpc";
import {status} from "grpc";
import {EventEmitter} from "events";
import {PromiseKit} from "./utility";
import {DarcherError, GRPCRawError, ServiceCancelledError, ServiceNotAvailableError} from "./error";

export type ReverseRPCHandler<ReqT, RespT> = (req: ReqT) => Promise<RespT>;

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
            this.stream.on("error", (e: grpc.ServiceError) => {
                switch (e.code) {
                    case status.CANCELLED:
                        reject(new ServiceCancelledError());
                        break;
                    default:
                        reject(new GRPCRawError(e));
                        break;
                }
            });
            this.stream.on("close", resolve);
            this.stream.on("end", resolve);
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
    private pendingCalls: { [id: string]: PromiseKit<RespT> };
    private emitter: EventEmitter;
    private _established: boolean;

    get established(): boolean {
        return this._established;
    }

    constructor() {
        this.emitter = new EventEmitter();
        this._established = false;
        this.pendingCalls = {};
    }

    public establish(stream: grpc.ServerDuplexStream<ReqT, RespT>) {
        this.emitter.emit("establish");
        this._established = true;
        this.stream = stream;
        this.stream.on("data", this.onData);
        this.stream.on("error", this.onError);
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

    private onError = (e: grpc.ServiceError) => {
        let err: DarcherError;
        switch (e.code) {
            case status.CANCELLED:
                err = new ServiceCancelledError();
                break;
            default:
                err = new GRPCRawError(e);
                break;
        }
        for (let id in this.pendingCalls) {
            let {reject} = this.pendingCalls[id];
            reject(err);
            this.pendingCalls = undefined;
            this._established = false;
        }
    };

    private onData = (data: RespT) => {
        if (data.getId() in this.pendingCalls) {
            this.pendingCalls[data.getId()].resolve(data);
            delete this.pendingCalls[data.getId()];
        }
    }

    /**
     * Call the reverse rpc, this will return a promise which resolves when the rpc returns, and rejects when error
     * @param request
     */
    public async call(request: ReqT): Promise<RespT> {
        return new Promise<RespT>((resolve, reject) => {
            if (!this.established) {
                reject(new ServiceNotAvailableError());
                return;
            }
            this.pendingCalls[request.getId()] = {resolve, reject};
            this.stream.write(request);
        });
    }

    public async close(): Promise<void> {
        return Promise.resolve();
    }
}
