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
import {ControlMsg, DBContent, RequestType} from "darcher-analyzer/src/rpc/dbmonitor_service_pb";
import {logger} from "darcher-analyzer/src/common";
import * as config from "@darcher/darcher-config";


class TabMaster {
    // stores
    private monitorDomain: string = "localhost";
    private dbNames: string[] = ["friend_database"];

    // websocket connection with dArcher
    private ws: WebSocket;
    // tab that runs dbMonitor
    private tab: Tab;

    private dbSnapshot: DBSnapshot;

    /**
     * 1. start websocket connection with dArcher
     * 2. listen for chrome messages
     */
    public start(dArcherUrl: string) {
        // listen for chrome messages (SettingMsg)
        chrome.runtime.onMessage.addListener(((message: SettingMsg, sender, sendResponse) => {
            // only SettingMsg will be sent to background
            let reply = this.onSettingMsg(<SettingMsg>message, sender);
            if (sendResponse) {
                sendResponse(reply);
            }
        }));

        // start websocket connection with dArcher
        let interval = setInterval(() => {
            try {
                this.ws = new WebSocket(dArcherUrl);
                this.ws.onopen = this.onWsOpen;
                this.ws.onmessage = this.onWsMessage;
                this.ws.onclose = this.onWsClose;
                this.ws.onerror = this.onWsError;
                clearInterval(interval);
            } catch (e) {
                logger.warn("Websocket connection failed, retrying in 500 ms");
            }
        }, 500);
    }

    private onWsOpen = () => {
        Logger.info("Websocket connection with dArcher opened");
    }

    private onWsMessage(message: any) {
        let request = ControlMsg.deserializeBinary(message.data);
        switch (request.getType()) {
            case RequestType.GET_ALL_DATA:
                // get all db data and send to darcher via websocket
                this.getAllDBData().then(value => {
                    this.ws.send(value.serializeBinary());
                });
                break;
            default:
                return;
        }
    }

    private onWsClose = () => {
        Logger.info("Websocket connection with dArcher closed");
    }

    private onWsError = (error) => {
        Logger.error("Websocket error:", error);
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
                this.tab = sender.tab;
                return undefined;
            default:
                return undefined;
        }
    }

    /**
     * Send message to content-script to get All DB data
     */
    private async getAllDBData(): Promise<DBContent> {
        let message: GetAllDataMsg = {
            type: ExtensionMsgType.DATA,
            operation: DataMsgOperation.GET_ALL,
            dbContent: null,
        };
        return new Promise(resolve => {
            chrome.tabs.sendMessage(this.tab.id, message, (response: GetAllDataMsg) => {
                resolve(response.dbContent);
            });
        });
    }
}

let master = new TabMaster();

master.start();