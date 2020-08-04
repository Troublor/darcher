import {
    DataMsgOperation,
    DBSnapshot,
    ExtensionMsgType,
    GetAllDataMsg,
    SettingMsg,
    SettingMsgOperation
} from "./types";
import {Logger} from "./helpers";
import MessageSender = chrome.runtime.MessageSender;
import Tab = chrome.tabs.Tab;
import {ControlMsg, DBContent, RequestType, TableContent} from "./rpc/dbmonitor_service_pb";
import {Error} from "./rpc/common_pb";
import {EventEmitter} from "events";

class TabMaster {
    private darcherUrl: string;
    // stores
    private monitorDomain: string = "localhost:63342";
    private dbNames: string[] = ["friend_database"];

    // websocket connection with dArcher
    private ws: WebSocket;
    // active tabs with address as their key
    private readonly tabs: { [address: string]: Tab };
    private eventEmitter: EventEmitter;

    private dbSnapshot: DBSnapshot;

    constructor(darcherUrl: string) {
        this.darcherUrl = darcherUrl;
        this.tabs = {};
        this.eventEmitter = new EventEmitter();
    }

    /**
     * 1. start websocket connection with dArcher
     * 2. listen for chrome messages
     */
    public start() {
        // listen for chrome messages (SettingMsg)
        chrome.runtime.onMessage.addListener(((message: SettingMsg, sender, sendResponse) => {
            // only SettingMsg will be sent to background
            let reply = this.onSettingMsg(<SettingMsg>message, sender);
            if (sendResponse) {
                sendResponse(reply);
            }
        }));

        // start websocket connection with dArcher
        this.connectWs();
    }

    private connectWs() {
        this.ws = new WebSocket(this.darcherUrl);
        this.ws.onopen = this.onWsOpen.bind(this);
        this.ws.onmessage = this.onWsMessage.bind(this);
        this.ws.onclose = this.onWsClose.bind(this);
        this.ws.onerror = this.onWsError.bind(this);
    }

    private onWsOpen = () => {
        Logger.info("Websocket connection with darcher opened");
    }

    /**
     * handle reverse RPCs via websocket from darcher
     * @param message
     */
    private async onWsMessage(message: any) {
        let request = ControlMsg.deserializeBinary(new Uint8Array(await message.data.arrayBuffer()));
        if (!this.tabs[request.getDbAddress()]) {
            // if no tab is registered, return serviceNotAvailable error
            request.setErr(Error.SERVICENOTAVAILABLEERR);
            this.ws.send(request.serializeBinary());
            return;
        }
        let address
        switch (request.getType()) {
            case RequestType.GET_ALL_DATA:
                address = request.getDbAddress();
                Logger.info(`Receive GetAllData request, dbAddress=${address}, dbName=${request.getDbName()}`);
                // get all db data and send to darcher via websocket
                this.getAllDBData(this.tabs[address], request.getDbName()).then(value => {
                    request.setData(value)
                    this.ws.send(request.serializeBinary());
                    Logger.info(`Served GetAllData request, dbAddress=${address}, dbName=${request.getDbName()}`);
                }).catch((err: Error) => {
                    request.setErr(err);
                    this.ws.send(request.serializeBinary());
                    Logger.error(`GetAllData request error, err=${err.toString()}, dbAddress=${address}, dbName=${request.getDbName()}`);
                });
                break;
            case RequestType.REFRESH_PAGE:
                address = request.getDbAddress();
                this.refreshPage(this.tabs[address]).then(() => {
                    this.ws.send(request.serializeBinary());
                }).catch((err: Error) => {
                    request.setErr(err);
                    this.ws.send(request.serializeBinary());
                });
                break;
            default:
                return;
        }
    }

    /**
     * when ws connect closed, try to re-connect darcher
     */
    private onWsClose = () => {
        Logger.info("Websocket connection with darcher closed");
        setTimeout(() => {
            Logger.info("Reconnect websocket with darcher");
            this.connectWs();
        }, 1000);
    }

    private onWsError = (ev: ErrorEvent) => {
        Logger.error("Websocket error:", ev);
    }


    public saveSnapshot() {

    }

    private onSettingMsg(msg: SettingMsg, sender: MessageSender): SettingMsg | undefined {
        switch (msg.operation) {
            case SettingMsgOperation.REGISTER:
                Logger.info("Monitor registered", "domain", msg.domain)
                this.tabs[msg.domain] = sender.tab;
                this.eventEmitter.emit("register", sender.tab);
                return undefined;
            default:
                return undefined;
        }
    }

    /**
     * Send message to content-script to get All DB data
     */
    private async getAllDBData(tab: Tab, dbName: string): Promise<Uint8Array> {
        let message: GetAllDataMsg = {
            type: ExtensionMsgType.DATA,
            operation: DataMsgOperation.GET_ALL,
            data: null,
            dbName: dbName,
        };
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tab.id, message, (response: GetAllDataMsg) => {
                if (!response.data) {
                    reject(Error.SERVICENOTAVAILABLEERR);
                }
                let data = [];
                for (let i in response.data) {
                    data.push(response.data[i]);
                }
                resolve(Uint8Array.from(data));
            });
        });
    }

    private async refreshPage(tab: Tab): Promise<void> {
        chrome.tabs.executeScript(tab.id, {
            code: "window.location.reload();",
        });
        return new Promise(resolve => {
            let listener = (newTab: Tab) => {
                if (tab.id === newTab.id) {
                    this.eventEmitter.removeListener("register", listener);
                    resolve();
                }
            }
            this.eventEmitter.on("register", listener);
        });
    }
}

// @ts-ignore WS_PORT is dynamically set in webpack.dynamic.js
let master = new TabMaster(ANALYZER_WS_ADDR);

master.start();