import * as WebSocket from "ws";
import http from "http";
import {getUUID, Logger, PromiseKit, ReverseRPCClient} from "@darcher/helpers";
import {ControlMsg, DBContent, GetAllDataControlMsg, IDBMonitorServiceServer, RequestType} from "@darcher/rpc"
import {Error as rpcError} from "@darcher/rpc";
import {ServerDuplexStream} from "grpc";

/**
 * DB monitor service, to get database data from dapp
 * Since grpc does not support bidirectional stream in browser, we use websocket as transport to simulate bidirectional stream
 */
export class DBMonitorServiceViaWebsocket {
    private readonly logger: Logger;
    private readonly port: number;
    private wss: WebSocket.Server;

    // connection with dbmonitor
    private conn: WebSocket;
    // reverse rpc pending calls
    private readonly pendingCalls: { [id: string]: PromiseKit<any> }; // map from call id to promise resolve/reject functions

    constructor(logger: Logger, port: number) {
        this.logger = logger;
        this.port = port;
        this.pendingCalls = {};
    }

    public async start(): Promise<void> {
        this.wss = new WebSocket.Server({port: this.port});
        this.wss.on("connection", this.onConnection);
        this.wss.on("error", this.onError);
    }

    public async shutdown(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.wss.close(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    }

    /* websocket handlers start */
    private onConnection = (ws: WebSocket, request: http.IncomingMessage) => {
        this.logger.info("Websocket connection with dbmonitor opened");
        this.conn = ws;
        ws.on("message", this.onMessage);
        ws.on("close", () => {
            this.logger.info("Websocket connection with dbmonitor closed")
            this.conn = undefined;
        });
    }

    /**
     * message handler of reverse RPC reply
     * @param message reply from dbmonitor
     */
    private onMessage = (message: any) => {
        let resp = ControlMsg.deserializeBinary(message);
        if (!resp.getId()) {
            return
        }
        let {resolve: resolveFunc, reject: rejectFunc} = this.pendingCalls[resp.getId()];
        let data = null;
        switch (resp.getType()) {
            case RequestType.GET_ALL_DATA:
                if (resp.getErr() !== rpcError.NILERR) {
                    rejectFunc ? rejectFunc(resp.getErr()) : undefined;
                } else {
                    data = DBContent.deserializeBinary(resp.getData() as Uint8Array);
                    resolveFunc ? resolveFunc(data) : undefined;
                }
                break;
            case RequestType.REFRESH_PAGE:
                if (resp.getErr() !== rpcError.NILERR) {
                    rejectFunc ? rejectFunc(resp.getErr()) : undefined;
                } else {
                    resolveFunc ? resolveFunc() : undefined;
                }
                break;
        }
    }

    private onError = (error: Error) => {
        this.logger.error("Websocket error", error);
    }

    /* websocket handlers end */

    /**
     * get all db data from dapp
     * @constructor
     */
    public async getAllData(address: string, dbName: string): Promise<DBContent> {
        let id = getUUID();
        if (!this.conn) {
            throw new Error("DBMonitorService not available")
        }
        let req = new ControlMsg();
        req.setId(id);
        req.setType(RequestType.GET_ALL_DATA);
        req.setDbAddress(address);
        req.setDbName(dbName);
        this.conn.send(req.serializeBinary());
        return new Promise<DBContent>((resolve, reject) => {
            this.pendingCalls[id] = {resolve, reject};
        });
    }

    public async refreshPage(address: string): Promise<void> {
        let id = getUUID();
        if (!this.conn) {
            throw new Error("DBMonitorService not available")
        }
        let req = new ControlMsg();
        req.setId(id);
        req.setType(RequestType.REFRESH_PAGE);
        req.setDbAddress(address);
        this.conn.send(req.serializeBinary());
        return new Promise((resolve, reject) => {
            this.pendingCalls[id] = {resolve, reject};
        });
    }
}

export class DBMonitorServiceViaGRPC implements IDBMonitorServiceServer {
    private readonly logger: Logger;

    private readonly getAllDataControlReverseRPC: ReverseRPCClient<GetAllDataControlMsg, GetAllDataControlMsg>;

    constructor(logger: Logger) {
        this.logger = logger;
        this.getAllDataControlReverseRPC = new ReverseRPCClient<GetAllDataControlMsg, GetAllDataControlMsg>();
    }

    public async waitForRRPCEstablishment(): Promise<void> {
        await this.getAllDataControlReverseRPC.waitForEstablishment();
    }

    public async shutdown(): Promise<void> {
        await this.getAllDataControlReverseRPC.close();
    }

    /**
     * Establish getAllDataControl reverse rpc
     * @param call
     */
    getAllDataControl(call: ServerDuplexStream<GetAllDataControlMsg, GetAllDataControlMsg>): void {
        if (this.getAllDataControlReverseRPC.established) {
            this.logger.warn("getAllDataControlReverseRPC already established, ignore new request");
            return
        }
        // serve the initial call
        this.logger.info("getAllDataControl reverse RPC connected");
        this.getAllDataControlReverseRPC.establish(call);
    }

    /**
     * Public function to getAllData
     * @param request
     */
    public getAllData(request: GetAllDataControlMsg): Promise<GetAllDataControlMsg> {
        return new Promise<GetAllDataControlMsg>((resolve, reject) => {
            if (!this.getAllDataControlReverseRPC) {
                reject("dbmonitor getAllData service not available");
                return
            }
            this.getAllDataControlReverseRPC.call(request).then(resolve).catch(reject);
        });
    }

}