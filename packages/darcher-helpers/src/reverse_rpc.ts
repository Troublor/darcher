export type ReverseRPCHandler<ReqT, RespT> = (req: ReqT) => Promise<RespT>;

import * as grpc from "grpc";

/**
 * Reverse RPC over grpc bidirectional stream.
 */
export class ReverseRPC<ReqT, RespT> {

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
    public close() {
        this.stream.cancel();
    }
}