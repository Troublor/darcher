"use strict"

import {BrowserLogger} from "@darcher/helpers-browser";

export interface Data {
    type: string
}

export interface NewTransaction extends Data {
    type: "NewTransaction",
    from: string,
    to: string,
    gas: string,
    gasPrice: string,
    value: string,
    hash?: string,
}

export default class MetaMaskNotifier {
    private ws: WebSocket;
    private logger: BrowserLogger;

    constructor(
        private readonly address: string,
    ) {
        this.logger = new BrowserLogger(BrowserLogger.Level.DEBUG, 'MetaMask-Notifier');
    }

    public start() {
        this.ws = new WebSocket(this.address);
        this.ws.onmessage = msg => this.onMessage(msg.data);
        this.ws.onerror = e => this.onError(e);
        this.ws.onclose = () => this.onClose();
        this.ws.onopen = () => this.logger.info("connected");
    }

    public onMessage(payload: string) {
        this.logger.debug("receive message", {msg: payload});
    }

    public onError(err: any) {
        this.logger.error(err);
    }

    public onClose() {
        this.ws = undefined;
        // try to reconnect
        this.logger.warn("reconnecting...");
        this.start();
    }

    public notifyUnapprovedTx(data: NewTransaction) {
        if (!this.ws) {
            this.logger.error("WebSocket not connected, fail to notify new transaction:", data);
            return;
        }
        this.logger.debug("Notify new transaction", {from: data.from, to: data.to});
        this.ws.send(JSON.stringify(data));
    }

    public notifyUnlockRequest(data: Data) {

    }
}

