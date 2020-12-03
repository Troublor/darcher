import Tab = chrome.tabs.Tab;
import {MsgType, RequestMsg, TestMsg} from "./types";
import {getDomainAndPort, Logger} from "./helpers";
import * as _ from "lodash";
import {ControlMsg, DBContent, RequestType} from "./rpc/dbmonitor_service_pb";
import {Error} from "./rpc/common_pb";
import {cat} from "shelljs";

class Master {
    // active tabs with address as their key, each address may have multiple tabs
    private readonly tabs: { [address: string]: Tab[] };

    constructor() {
        this.tabs = {};
    }

    public start() {
        // start listen to chrome messages from content-script or popup
        chrome.runtime.onMessage.addListener((msg: TestMsg, sender, sendResponse) => {
            switch (msg.type) {
                case MsgType.TEST:
                    // receive test message from popup
                    this.processTestMsg(msg).then(response => {
                        if (response instanceof DBContent) {
                            sendResponse(response.toObject());
                        } else {
                            sendResponse(response);
                        }
                    }).catch((e) => {
                        sendResponse({
                            error: e.toString()
                        });
                    })
                    break;
            }
            return true;
        });

        // update tab in this.tabs when it is updated
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (tab.status === "complete") {
                // only register the tab when it is complete
                this.registerTab(tab);
            } else {
                this.unregisterTab(tabId);
            }
        })

        // remove tab in the this.tabs when the tab is removed/closed
        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            this.unregisterTab(tabId);
        });
    }

    /**
     * Register a new tab
     * @param tab
     * @private
     */
    private registerTab(tab: Tab) {
        if (!tab) {
            // if tab is invalid
            return;
        }

        const url = tab.url;
        if (!url) {
            // if url is empty
            return;
        }

        // get the address of the tab: domain+port
        const address = getDomainAndPort(url).trim();
        // put the tab in the list of addresses
        if (this.tabs[address]) {
            if (!this.tabs[address].some(t => t.id === tab.id)) {
                // push in the array if not exist
                this.tabs[address].push(tab);
            }
        } else {
            this.tabs[address] = [tab];
        }

        Logger.info("Tab registered")
    }

    /**
     * Unregister a new tab
     * @param tabId
     * @private
     */
    private unregisterTab(tabId: number) {
        for (const address of Object.keys(this.tabs)) {
            _.remove(this.tabs[address], (value: Tab) => tabId === value.id);
        }
    }

    /**
     * Process the {@link TestMsg} from popup
     * @param msg
     * @private
     */
    private async processTestMsg(msg: TestMsg): Promise<any> {
        switch (msg.testType) {
            case "fetch-html":
                // simulate a RequestMsg
                const requestMsg = <RequestMsg>{
                    type: MsgType.REQUEST,
                    requestType: "html",
                    elements: msg.elements,
                    js: msg.js,
                };
                const resp = await this.getDAppState(msg.address, requestMsg);
                return DBContent.deserializeBinary(resp);
            case "refresh":
                await this.refreshPage(msg.address);
                return;
            case "tabs":
                if (!msg.address) {
                    return this.tabs;
                } else {
                    return this.tabs[msg.address];
                }
        }
    }

    /**
     * Refresh all the tabs with the address
     * The promise will resolve when all refresh finish
     * @param address
     * @private
     */
    private async refreshPage(address: string) {
        if (this.tabs[address]) {
            const refreshOne = async (tab: Tab) => {
                return new Promise<void>(resolve => {
                    const cb = (tabId, changeInfo) => {
                        if (tabId != tab.id) {
                            return;
                        }
                        if (changeInfo.status === "complete") {
                            chrome.tabs.onUpdated.removeListener(cb);
                            resolve();
                        }
                    };
                    chrome.tabs.onUpdated.addListener(cb);
                    chrome.tabs.executeScript(tab.id, {
                        code: "window.location.reload();",
                    });
                });
            };
            await Promise.all(this.tabs[address].map(tab => refreshOne(tab)));
        }
    }

    /**
     * Send message to content-script to get DApp state
     * @return the serialized {@link DBContent}
     */
    private async getDAppState(address: string, msg: RequestMsg): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const tabs = this.tabs[address];
            if (!tabs || tabs.length === 0) {
                // no tab available
                reject(Error.SERVICENOTAVAILABLEERR);
            }
            // currently we only send request to the latest tab of this address
            // TODO need to handle multiple tabs for the same DApp
            const tab = tabs[tabs.length - 1];
            // response from tab should be the serialized (Uint8Array) DBContent
            chrome.tabs.sendMessage(tab.id, msg, (response: Uint8Array) => {
                if (!response) {
                    reject(Error.SERVICENOTAVAILABLEERR);
                }
                let data = [];
                for (let i in response) {
                    data.push(response[i]);
                }
                resolve(Uint8Array.from(data));
            });
        });
    }

    /**
     * Process the ControlMsg from @darcher/rpc
     * @param controlMsg
     */
    public async processControlMsg(controlMsg: ControlMsg): Promise<ControlMsg> {
        return new Promise<ControlMsg>(resolve => {
            let address
            switch (controlMsg.getType()) {
                case RequestType.GET_ALL_DATA:
                    address = controlMsg.getDbAddress();
                    Logger.info(`Receive GetAllData request, dbAddress=${address}, dbName=${controlMsg.getDbName()}`);
                    // get all db data and send to darcher via websocket
                    let requestMsg: RequestMsg;
                    if (controlMsg.getDbName().toLowerCase() === "html") {
                        // we use "html" as a special indication of use html mode to fetch DApp state
                        // the config for html mode is delivered in ControlMsg.Data
                        let payload: string;
                        if (typeof controlMsg.getData() === "string") {
                            payload = controlMsg.getData() as string;
                        } else {
                            // bytes array (Uint8Array)
                            payload = new TextDecoder("utf-8").decode(controlMsg.getData() as Uint8Array);
                        }
                        try {
                            if (payload.trim().startsWith("[")) {
                                const elements = JSON.parse(payload);
                                requestMsg = {
                                    type: MsgType.REQUEST,
                                    requestType: "html",
                                    elements: elements,
                                };
                            } else {
                                requestMsg = {
                                    type: MsgType.REQUEST,
                                    requestType: "html",
                                    js: payload,
                                };
                            }
                        } catch (e) {
                            requestMsg = {
                                type: MsgType.REQUEST,
                                requestType: "html",
                                js: payload,
                            };
                        }
                    } else {
                        // indexedDB mode
                        requestMsg = {
                            type: MsgType.REQUEST,
                            requestType: "indexedDB",
                            dbName: controlMsg.getDbName(),
                        }
                    }

                    this.getDAppState(address, requestMsg).then(value => {
                        controlMsg.setData(value)
                        resolve(controlMsg);
                        Logger.info(`Served GetAllData request, dbAddress=${address}, dbName=${controlMsg.getDbName()}`);
                    }).catch((err: Error) => {
                        controlMsg.setErr(err);
                        resolve(controlMsg);
                        Logger.error(`GetAllData request error, err=${err.toString()}, dbAddress=${address}, dbName=${controlMsg.getDbName()}`);
                    });
                    break;
                case RequestType.REFRESH_PAGE:
                    address = controlMsg.getDbAddress();
                    this.refreshPage(address).then(() => {
                        resolve(controlMsg);
                    }).catch((err: Error) => {
                        controlMsg.setErr(err);
                        resolve(controlMsg);
                    });
                    break;
                default:
                    return;
            }
        })
    }
}

let master = new Master();
master.start();

// @ts-ignore WS_PORT is dynamically set in webpack.dynamic.js
const darcherUrl = ANALYZER_WS_ADDR;

function connectWs() {
    const ws = new WebSocket(darcherUrl);
    ws.onopen = () => {
        Logger.info("Websocket connection with darcher opened");
    };
    ws.onmessage = async (message) => {
        const request = ControlMsg.deserializeBinary(new Uint8Array(await message.data.arrayBuffer()));
        const response = await master.processControlMsg(request);
        ws.send(response.serializeBinary());
    };
    ws.onclose = () => {
        // when connection is closed, try to re-connect
        Logger.info("Websocket connection with darcher closed");
        setTimeout(() => {
            Logger.info("Reconnect websocket with darcher");
            connectWs();
        }, 1000);
    };
    ws.onerror = (ev: ErrorEvent) => {
        Logger.error("Websocket error:", ev);
    };
}

connectWs();
