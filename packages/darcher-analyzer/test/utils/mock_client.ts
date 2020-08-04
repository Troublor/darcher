import {EventEmitter} from "events";
import {ControlMsg, DBContent, RequestType, TableContent} from "@darcher/rpc";
import {Logger, Service, WebsocketError} from "@darcher/helpers";
import * as WebSocket from "ws";

/**
 * This mock ws client is used to test DarcherServer ws service.
 */
export class MockWsClient implements Service {
    private logger: Logger;
    // stores
    private readonly analyzerAddress: string;
    // websocket connection with dArcher
    private ws: WebSocket;
    // active tabs with address as their key
    private eventEmitter: EventEmitter;

    constructor(logger: Logger, analyzerAddress: string) {
        this.logger = logger;
        this.analyzerAddress = analyzerAddress;
        this.eventEmitter = new EventEmitter();
    }

    /**
     * 1. start websocket connection with dArcher
     * 2. listen for chrome messages
     */
    async start(): Promise<void> {
        // start websocket connection with dArcher
        this.connectWs();
    }

    async shutdown(): Promise<void> {
        this.ws.close();
    }

    async waitForEstablishment(): Promise<void> {
        return Promise.resolve(undefined);
    }

    private connectWs() {
        this.ws = new WebSocket(this.analyzerAddress);
        this.ws.onopen = this.onWsOpen.bind(this);
        this.ws.onmessage = this.onWsMessage.bind(this);
        this.ws.onclose = this.onWsClose.bind(this);
        this.ws.onerror = this.onWsError.bind(this);
    }

    private onWsOpen = () => {
        this.logger.info("Websocket connection with darcher opened");
    }

    /**
     * handle reverse RPCs via websocket from darcher
     * @param message
     */
    private async onWsMessage(message: any) {
        let request = ControlMsg.deserializeBinary(message.data);
        switch (request.getType()) {
            case RequestType.GET_ALL_DATA:
                let content = new DBContent();
                let table = new TableContent();
                table.addKeypath("mock");
                content.getTablesMap().set("mock", table);
                request.setData(content.serializeBinary());
                this.ws.send(request.serializeBinary());
                break;
            case RequestType.REFRESH_PAGE:
                request.setData("mock");
                this.ws.send(request.serializeBinary());
                break;
            default:
                return;
        }
    }

    /**
     * when ws connect closed, try to re-connect darcher
     */
    private onWsClose = () => {
        this.logger.info("Websocket connection with darcher closed");
    }

    private onWsError = (ev: ErrorEvent) => {
        this.logger.error(new WebsocketError(ev.error));
    }


    public saveSnapshot() {

    }
}