import {
    DataMsg,
    DataMsgOperation,
    DBChange,
    DBSnapshot,
    ExtensionMsgType,
    GetAllDataMsg,
    SettingMsg,
    SettingMsgOperation,
    TableSnapshot
} from "./types";
import {getDomainAndPort, Logger} from "./helpers";
import Dexie from "dexie";
import {ControlMsg, DBContent, RequestType, TableContent} from "./rpc/dbmonitor_service_pb";

// get current domain
let msg: SettingMsg = {
    type: ExtensionMsgType.SETTING,
    operation: SettingMsgOperation.FETCH,
    domain: "",
}

// @ts-ignore DB_ADDRESS is webpack env
if (getDomainAndPort(window.location.href).trim().includes(DB_ADDRESS)) {
    Logger.info("Domain matched, start monitoring");
    chrome.runtime.sendMessage(msg, (response: SettingMsg) => {
        // register on background that this page has dbMonitor running
        chrome.runtime.sendMessage(<SettingMsg>{
            type: ExtensionMsgType.SETTING,
            operation: SettingMsgOperation.REGISTER,
            domain: getDomainAndPort(location.href).trim()
        });
        Logger.info("Monitor registered");
        // @ts-ignore DB_NAME is webpack env
        monitorDB([DB_NAME]);
    });
} else {
    Logger.info("Domain mismatch, disable monitoring");
}

async function monitorDB(dbNames: string[]) {
    let monitor = new dbMonitor(dbNames);
    monitor.start();
    monitor.getAll().then(content => {

    })
}


class dbMonitor {
    private dbNames: string[]
    private readonly dbFetcherMap: { [dbName: string]: DBFetcher };

    constructor(dbNames: string[]) {
        this.dbFetcherMap = {};
        this.dbNames = dbNames;
        for (let dbName of dbNames) {
            this.dbFetcherMap[dbName] = new DBFetcher(dbName);
        }
    }

    /**
     * start to listen chrome extension messages from background.js
     */
    public start() {
        // handle db queries
        chrome.runtime.onMessage.addListener((message: DataMsg, sender, sendResponse) => {
            // only DataMsg will be sent from background to content-script
            this.onDataMsg(message).then(reply => {
                if (reply) {
                    sendResponse(reply);
                }
            });
            return true;
        });
    }

    private async onDataMsg(msg: DataMsg): Promise<DataMsg | undefined> {
        switch (msg.operation) {
            case DataMsgOperation.GET_ALL:
                let message: GetAllDataMsg = <GetAllDataMsg>msg;
                // TODO currently only support one DB
                if (!(message.dbName in this.dbFetcherMap)) {
                    // if dbName does not exist, return null data
                    message.data = null;
                    return message
                }
                Logger.info(`Get GetAllData request, dbName=${message.dbName}`);
                let dbContent = await this.dbFetcherMap[message.dbName].getAll();
                message.data = dbContent.serializeBinary();
                let controlMsg = new ControlMsg();
                controlMsg.setData(message.data);
                Logger.info(`Served GetAllData request, dbName=${message.dbName}`);
                return message;
            default:
                return undefined;
        }
    }

    /**
     * Get all database data
     */
    public async getAll(): Promise<{ [dbName: string]: DBContent }> {
        let data: { [dbName: string]: DBContent } = {};
        for (let dbName in this.dbFetcherMap) {
            data[dbName] = await this.dbFetcherMap[dbName].getAll();
        }
        return data;
    }

    /**
     * Get database change in the time limit
     * @param timeLimit time limit (millisecond)
     */
    private async getChangeInTimeLimit(timeLimit: number): Promise<any> {

    }
}

class DBFetcher {
    private readonly dbName: string;
    private db: Dexie;
    private snapshot: DBSnapshot;

    constructor(dbName: string) {
        this.dbName = dbName;
        this.db = null;
    }

    private async checkDB(): Promise<void> {
        // lazy connection
        if (!this.db) {
            this.db = await new Dexie(this.dbName).open();
        }
    }

    public async getAll(): Promise<DBContent> {
        try {
            await this.checkDB();
        } catch (e) {
            Logger.error(`Connect to database ${this.dbName} failed: `, e);
            return null;
        }
        let data: DBContent = new DBContent();
        for (const table of this.db.tables) {
            let storeName = table.name;
            try {
                let tableContent = new TableContent();
                let keyPath = table.schema.primKey.keyPath;
                if (Array.isArray(keyPath)) {
                    tableContent.setKeypathList(keyPath);
                } else {
                    tableContent.setKeypathList([keyPath]);
                }
                let entries = await table.toArray();
                for (let entry of entries) {
                    tableContent.addEntries(JSON.stringify(entry));
                }
                data.getTablesMap().set(storeName, tableContent);
            } catch (e) {
                Logger.error(`Fetch data from ${this.dbName}.${storeName} failed:`, e);
            }
        }
        return data;
    }

    private async getSnapshot(): Promise<DBSnapshot> {
        try {
            await this.checkDB();
        } catch (e) {
            Logger.error(`Connect to database ${this.dbName} failed: `, e);
            return null;
        }
        let snapshot: DBSnapshot = {};
        for (const table of this.db.tables) {
            let storeName = table.name;
            try {
                let content = await table.toArray();
                let collections = await table.toCollection();
                let primaryKeys = await collections.primaryKeys();
                snapshot[storeName] = new TableSnapshot(table.schema.primKey.keyPath, content, primaryKeys);
            } catch (e) {
                Logger.error(`Fetch data from ${this.dbName}.${storeName} failed:`, e);
            }
        }
        return snapshot;
    }

    public async saveSnapshot() {
        this.snapshot = await this.getSnapshot();
    }

    public async getChange() {
        try {
            await this.checkDB();
        } catch (e) {
            Logger.error(`Connect to database ${this.dbName} failed: `, e);
            return null;
        }
        let newSnapshot = await this.getSnapshot();
        let change: DBChange = {};
        for (let table of this.db.tables) {
            change[table.name] = TableSnapshot.getChange(this.snapshot[table.name], newSnapshot[table.name]);
        }
        return change;
    }
}