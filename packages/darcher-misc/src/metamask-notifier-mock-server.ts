import {Logger, WebsocketError} from "@darcher/helpers";
import * as WebSocket from "ws";
import {Data} from "./metamask-notifier";

export class MetaMaskNotifierMockServer {
    private wss: WebSocket.Server | undefined;


    constructor(
        private readonly port: number,
        private readonly logger?: Logger) {
        if (!this.logger) {
            this.logger = new Logger("MetaMaskNotifierMockServer", 'info');
        }
    }

    public async start() {
        this.wss = new WebSocket.Server({port: this.port});
        this.wss.on("connection", ws => {
            this.logger.info("Websocket connection with MetaMask Notifier opened");
            ws.on("message", (message: string) => {
                const data = JSON.parse(message) as Data;
                this.logger.info("receive message", {
                    type: data.type,
                    msg: message,
                });
            });
            ws.on("close", () => {
                this.logger.info("Websocket connection with MetaMask Notifier closed")
            });
        });
        this.wss.on("error", (error) => {
            this.logger.error(new WebsocketError(error));
        });
        this.logger.info(`MetaMask Notifier started via WebSocket at port ${this.port}`)
    }

    public async shutdown() {
        return new Promise<void>((resolve, reject) => {
            if (!this.wss) {
                this.logger.info("MetaMask Notifier already shutdown")
                resolve();
                return;
            }
            this.wss.close(err => {
                if (err) {
                    reject(err);
                } else {
                    this.logger.info("MetaMask Notifier shutdown")
                    resolve();
                }
            });
        });
    }
}

if (require.main === module) {
    (async () => {
        const store = new MetaMaskNotifierMockServer(1237);
        await store.start();
        process.on('SIGINT', async () => {
            await store.shutdown();
        });
    })()
}
