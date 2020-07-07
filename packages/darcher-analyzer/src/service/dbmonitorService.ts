import * as WebSocket from "ws";
import http from "http";
import {getUUID, logger} from "../common";
import {ControlMsg, DBContent, RequestType} from "../rpc/dbmonitor_service_pb"

/**
 * DB monitor service, to get database data from dapp
 * Since grpc does not support bidirectional stream in browser, we use websocket as transport to simulate bidirectional stream
 */
export class DBMonitorService {
    private readonly port: number;
    private wss: WebSocket.Server;

    // connection with dbmonitor
    private conn: WebSocket;
    // reverse rpc pending calls
    private pendingCalls: { [id: string]: Function }; // map from call id to promise resolve functions

    constructor(port: number) {
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
        logger.info("Websocket connection with dbmonitor opened");
        this.conn = ws;
        ws.on("message", this.onMessage);
        ws.on("close", () => {
            logger.info("Websocket connection with dbmonitor closed")
            this.conn = undefined;
        });
    }

    private onMessage = (message: any) => {
        let req = ControlMsg.deserializeBinary(message);
        let resolveFunc = this.pendingCalls[req.getId()];
        let data = null;
        switch (req.getType()) {
            case RequestType.GET_ALL_DATA:
                data = DBContent.deserializeBinary(req.getData().getValue() as Uint8Array);
        }
        if (resolveFunc) {
            resolveFunc(data);
        }
    }

    private onError = (error: Error) => {
        logger.error("Websocket error", error);
    }

    /* websocket handlers end */

    /**
     * get all db data from dapp
     * @constructor
     */
    public async GetAllData(): Promise<DBContent> {
        let id = getUUID();
        if (!this.conn) {
            throw new Error("DBMonitorService not available")
        }
        let req = new ControlMsg();
        req.setId(id);
        req.setType(RequestType.GET_ALL_DATA);
        this.conn.send(req.serializeBinary());
        return new Promise<DBContent>(resolve => {
            this.pendingCalls[id] = resolve;
        });
    }
}