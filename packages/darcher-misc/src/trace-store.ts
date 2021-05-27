import {Logger, prettifyHash, WebsocketError} from "@darcher/helpers";
import * as WebSocket from "ws";
import {SendTransactionTrace} from "./trace-instrument";
import * as fs from "fs";
import * as path from "path";

export class TraceStore {
    private wss: WebSocket.Server | undefined;


    constructor(
        private readonly port: number,
        private readonly logger?: Logger,
        private readonly save_dir?: string | undefined,
        private readonly callback?: undefined | ((trace: SendTransactionTrace) => void)) {
        if (!this.logger) {
            this.logger = new Logger("TraceStore", 'info');
        }
    }

    public async start() {
        if (this.save_dir && !fs.existsSync(this.save_dir)) {
            fs.mkdirSync(this.save_dir, {recursive: true});
        }
        this.logger.info(`Transaction trace will be saved in ${this.save_dir}`);

        this.wss = new WebSocket.Server({port: this.port});
        this.wss.on("connection", ws => {
            this.logger.debug("Websocket connection with trace store opened");
            ws.on("message", (message: string) => {
                const msg: SendTransactionTrace = JSON.parse(message);
                if (this.save_dir) {
                    fs.writeFileSync(path.join(this.save_dir, `${msg.hash}.json`), JSON.stringify(msg, null, 2));
                }
                if (this.callback) {
                    this.callback(msg);
                }
                this.logger.info("Save transaction trace", {tx: prettifyHash(msg.hash)});
                // notify client the transaction has been received
                ws.send("");
            });
            ws.on("close", () => {
                this.logger.debug("Websocket connection with trace store closed")
            });
        });
        this.wss.on("error", (error) => {
            this.logger.error(new WebsocketError(error));
        });
        this.logger.info(`Trace store started via WebSocket at port ${this.port}`)
    }

    public async shutdown() {
        return new Promise<void>((resolve, reject) => {
            if (!this.wss) {
                this.logger.info("Trace store already shutdown")
                resolve();
                return;
            }
            this.wss.close(err => {
                if (err) {
                    reject(err);
                } else {
                    this.logger.info("Trace store shutdown")
                    resolve();
                }
            });
        });
    }
}

if (require.main === module) {
    (async () => {
        const store = new TraceStore(1236, undefined, path.join(__dirname, "data"));
        await store.start();
        process.on('SIGINT', async () => {
            await store.shutdown();
        });
    })()
}
