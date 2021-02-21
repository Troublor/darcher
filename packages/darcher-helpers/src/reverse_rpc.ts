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
    private readonly name: string;
    private stream: grpc.ClientDuplexStream<RespT, ReqT>
    private emitter: EventEmitter

    constructor(name: string, stream: grpc.ClientDuplexStream<RespT, ReqT>) {
        this.name = name;
        this.stream = stream;
        this.emitter = new EventEmitter();
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
                        reject(new ServiceCancelledError(this.name));
                        break;
                    case status.UNAVAILABLE:
                        console.log("unavailable");
                        reject(new ServiceNotAvailableError(this.name));
                        break;
                    default:
                        reject(new GRPCRawError(this.name, e));
                        break;
                }
            });
            this.stream.on("close", resolve);
            this.stream.on("end", () => {
                // if stream is ended from the other side, we also end from our side as well.
                this.stream.end();
                resolve();
            });
            this.emitter.on("close", resolve);
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
        return new Promise(resolve => {
            if (this.stream) {
                this.stream.end();
                this.emitter.emit("close");
                resolve();
                return;
            }
            resolve();
        });
    }
}

/**
 * Reverse RPC server over grpc bidirectional stream.
 * This is actually the grpc server but acts logically as reverse RPC client.
 */
export class ReverseRPCClient<ReqT extends Identifiable, RespT extends Identifiable> {
    private readonly name: string;
    private stream: grpc.ServerDuplexStream<ReqT, RespT>;
    private pendingCalls: { [id: string]: PromiseKit<RespT> };
    private emitter: EventEmitter;
    private _established: boolean;

    get established(): boolean {
        return this._established;
    }

    constructor(name: string) {
        this.name = name;
        this.emitter = new EventEmitter();
        this._established = false;
        this.pendingCalls = {};
    }

    public establish(stream: grpc.ServerDuplexStream<ReqT, RespT>) {
        this.emitter.emit("establish");
        this._established = true;
        if (this.stream) {
            // if previously there is already a connect, end that first
            this.stream.end();
        }
        this.stream = stream;
        stream.on("data", this.onData);
        stream.on("error", this.onError);
        stream.on("end", () => {
            // if the stream is ended by the other side, we also end from our side too, and set reverse rpc not established.
            if (this.stream === stream) {
                // to avoid data race, we check whether the ended stream is current this.stream
                this.stream?.end();
                this.stream = undefined;
                this._established = false;
            }
        });
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
                err = new ServiceCancelledError(this.name);
                break;
            default:
                err = new GRPCRawError(this.name, e);
                break;
        }
        for (let id in this.pendingCalls) {
            let {reject} = this.pendingCalls[id];
            reject(err);
            this.pendingCalls[id] = undefined;
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
                reject(new ServiceNotAvailableError(this.name));
                return;
            }
            this.pendingCalls[request.getId()] = {resolve, reject};
            this.stream.write(request);
        });
    }

    public async close(): Promise<void> {
        return new Promise(resolve => {
            if (this.stream) {
                this.stream.end();
                resolve();
            }
            resolve();
        })
    }
}
