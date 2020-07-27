import * as WebSocket from "ws";
import http from "http";
import {getUUID, Logger} from "@darcher/helpers";
import {ControlMsg, DBContent, RequestType} from "@darcher/rpc"
import {Error as rpcError} from "@darcher/rpc";

/**
 * DB monitor service, to get database data from dapp
 * Since grpc does not support bidirectional stream in browser, we use websocket as transport to simulate bidirectional stream
 */
export class DBMonitorService {
    private readonly logger: Logger;
    private readonly port: number;
    private wss: WebSocket.Server;

    // connection with dbmonitor
    private conn: WebSocket;
    // reverse rpc pending calls
    private readonly pendingCalls: { [id: string]: [Function, Function] }; // map from call id to promise resolve/reject functions

    constructor(logger: Logger,port: number) {
        this.logger = logger;
        this.port = port;
        this.pendingCalls = {};
    }

    public start() {
        this.wss = new WebSocket.Server({port: this.port});
        this.wss.on("connection", this.onConnection);
        this.wss.on("error", this.onError);
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
        let [resolveFunc, rejectFunc] = this.pendingCalls[resp.getId()];
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
            this.pendingCalls[id] = [resolve, reject];
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
            this.pendingCalls[id] = [resolve, reject];
        });
    }
}