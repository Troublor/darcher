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
import config from "@darcher/config"
import {Error} from "./rpc/common_pb";

class TabMaster {
    private darcherUrl: string;
    // stores
    private monitorDomain: string = "localhost:63342";
    private dbNames: string[] = ["friend_database"];

    // websocket connection with dArcher
    private ws: WebSocket;
    // active tabs with address as their key
    private tabs: { [address: string]: Tab };

    private dbSnapshot: DBSnapshot;

    /**
     * 1. start websocket connection with dArcher
     * 2. listen for chrome messages
     */
    public start(darcherUrl: string) {
        this.darcherUrl = darcherUrl;
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
        if (!this.tabs[request.getAddress()]) {
            // if no tab is registered, return serviceNotAvailable error
            request.setErr(Error.SERVICENOTAVAILABLEERR);
            this.ws.send(request.serializeBinary());
            return;
        }
        switch (request.getType()) {
            case RequestType.GET_ALL_DATA:
                let address = request.getAddress();
                // get all db data and send to darcher via websocket
                this.getAllDBData(this.tabs[address], request.getDbName()).then(value => {
                    request.setData(value)
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
            case SettingMsgOperation.FETCH:
                msg.domain = this.monitorDomain;
                msg.dbNames = this.dbNames;
                return msg;
            case SettingMsgOperation.UPDATE:
                this.monitorDomain = msg.domain;
                this.dbNames = msg.dbNames;
                return undefined;
            case SettingMsgOperation.REGISTER:
                this.tabs[msg.domain] = sender.tab;
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
}

let master = new TabMaster();

master.start(`ws://localhost:${config.rpcPort["darcher-dbmonitor"].ws}`);