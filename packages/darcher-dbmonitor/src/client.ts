/**
 * The grpc client to connect with darcher-analyzer through dbmonitor service
 */
import {DBMonitorServiceClient, GetAllDataControlMsg, Role} from "@darcher/rpc";
import * as grpc from "grpc";
import {getUUID, Logger, ReverseRPCServer, ReverseRPCHandler} from "@darcher/helpers";


export class Client {
    private logger: Logger;

    private readonly analyzerAddr: string;

    private conn: DBMonitorServiceClient;

    // reverse RPCs
    private getAllDataReverseRPC: ReverseRPCServer<GetAllDataControlMsg, GetAllDataControlMsg>

    constructor(logger: Logger, analyzerAddr: string) {
        this.analyzerAddr = analyzerAddr;
        this.logger = logger;
        this.conn = new DBMonitorServiceClient(this.analyzerAddr, grpc.credentials.createInsecure());
    }

    /**
     * Serve getAllData reverse rpc
     */
    public async serveGetAllDataControl(handler: ReverseRPCHandler<GetAllDataControlMsg, GetAllDataControlMsg>) {
        // send an initial message to register reverse rpc
        const req = new GetAllDataControlMsg();
        req.setRole(Role.DBMONITOR);
        req.setId(getUUID());
        let stream = this.conn.getAllDataControl();
        stream.write(req)
        // initial reverse rpc
        this.getAllDataReverseRPC = new ReverseRPCServer<GetAllDataControlMsg, GetAllDataControlMsg>("getAllData", stream);
        await this.getAllDataReverseRPC.serve(handler);
    }

    public async shutdown(): Promise<void> {
        await this.getAllDataReverseRPC.close();
    }
}