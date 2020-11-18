"use strict"

import {Logger} from "@darcher/helpers-browser";

export interface Data {
    type: string
}

export interface UnlockRequest extends Data {
    type: 'UnlockRequest',
}

export interface PermissionRequest extends Data {
    type: 'PermissionRequest',
}

export interface UnconfirmedMessage extends Data {
    type: 'UnconfirmedMessage',
}

export interface UnapprovedTx extends Data {
    type: "UnapprovedTx",
    from: string,
    to: string,
    gas: string,
    gasPrice: string,
    value: string,
    hash?: string,
}

export default class MetaMaskNotifier {
    private ws: WebSocket;
    private logger: Logger;

    constructor(
        private readonly address: string,
    ) {
        this.logger = new Logger('MetaMask-Notifier', Logger.Level.DEBUG);
    }

    public start() {
        this.ws = new WebSocket(this.address);
        this.ws.onmessage = msg => this.onMessage(msg.data);
        this.ws.onerror = e => this.onError(e);
        this.ws.onclose = () => this.onClose();
        this.ws.onopen = () => this.logger.info("WebSocket connection opened");
    }

    public onMessage(payload: string) {
        this.logger.debug("receive message", {msg: payload});
    }

    public onError(err: any) {
        this.logger.error(err);
    }

    public onClose() {
        this.ws = undefined;
        this.logger.info("WebSocket connection closed");
        // try to reconnect
        setTimeout(() => {
            this.logger.warn("reconnecting...");
            this.start();
        }, 1000);
    }

    private notify(data: Data) {
        if (!this.ws) {
            this.logger.error("WebSocket not connected, fail to notify new transaction:", data);
            return;
        }
        try {
            this.ws.send(JSON.stringify(data));
        } catch (e) {
            this.logger.error("Notify error", {err: e});
        }
    }

    public notifyUnapprovedTx(data: UnapprovedTx) {
        this.logger.debug("Notify unapproved transaction", {from: data.from, to: data.to});
        this.notify(data);
    }

    public notifyUnlockRequest(data: UnlockRequest) {
        this.logger.debug("Notify unlock request");
        this.notify(data);
    }

    public notifyPermissionRequest(data: PermissionRequest) {
        this.logger.debug("Notify permission request");
        this.notify(data);
    }

    public notifyUnconfirmedMessage(data: UnconfirmedMessage) {
        this.logger.debug("Notify unconfirmed message");
        this.notify(data);
    }
}

