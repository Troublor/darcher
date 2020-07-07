import WebSocket from "ws";
import * as http from "http";
import {logger} from "../common";

export interface Change {
    key: any
    from: { [k: string]: object }
    to: { [k: string]: object }
}

export type TableChange = Change[];


export type DBChange = { [tableName: string]: TableChange }

/**
 * DBMonitor maintains a websocket server to connect with dbMonitor(-browser)
 */
export class DBMonitor {
    private port: number;
    private wss: WebSocket.Server;

    constructor(port: number) {
        this.port = port;
        this.wss = new WebSocket.Server({port});

    }

    private onConnection(ws: WebSocket, request: http.IncomingMessage) {
        logger.info("Websocket connection opened", ws.url);
    }

    private onMessage(message: string) {

    }

    private onError(error: Error) {
        logger.error("Websocket error", error);
    }

    private onClose() {
        logger.error("Websocket connection closed");
    }

    public async saveSnapshot(): Promise<void> {

    }
}