import {DBChange, DBSnapshot, TableSnapshot} from "./types";
import {Logger} from "./helpers";
import Dexie from "dexie";
import {RequestMsg} from "./types";
import {DBContent, TableContent} from "./rpc/dbmonitor_service_pb";

class DAppStateFetcher {
    private readonly dbFetcherMap: { [dbName: string]: DBFetcher };

    constructor() {
        this.dbFetcherMap = {};
    }

    /**
     * start to listen chrome extension messages from background.js
     */
    public start() {
        // handle db queries
        chrome.runtime.onMessage.addListener((message: RequestMsg, sender, sendResponse) => {
            // only RequestMsg will be sent from background to content-script
            this.processRequestMsg(message).then(reply => {
                sendResponse(reply);
            });
            return true;
        });
    }

    /**
     * Process the {@link RequestMsg}
     * if request type is to get all data, returns the serialized (Uint8Array) DBContent
     * @param msg
     * @private
     */
    private async processRequestMsg(msg: RequestMsg): Promise<Uint8Array | undefined> {
        let dbContent: DBContent;
        switch (msg.requestType) {
            case "indexedDB":
                if (msg.dbName === undefined) {
                    return undefined;
                }
                if (!(msg.dbName in this.dbFetcherMap)) {
                    // if dbName does not exist in dbFetcherMap, create one
                    this.dbFetcherMap[msg.dbName] = new DBFetcher(msg.dbName);
                }
                Logger.info(`Get FetchDAppState request, dbName=${msg.dbName}`);
                dbContent = await this.dbFetcherMap[msg.dbName].getAll();
                const response = dbContent.serializeBinary();
                Logger.info(`Served FetchDAppState request, dbName=${msg.dbName}`);
                return response;
            case "html":
                const elements = msg.elements;
                if (elements === undefined) {
                    return undefined;
                }
                const result = {};
                elements.forEach(value => {
                    result[value.name] = DAppStateFetcher.getHtmlElementValue(value.xpath);
                });
                const tableContent = new TableContent();
                tableContent.setKeypathList([])
                    .addEntries(JSON.stringify(result));
                dbContent = new DBContent();
                dbContent.getTablesMap()
                    .set("html", tableContent);
                return dbContent.serializeBinary();
            default:
                return undefined;
        }
    }

    /**
     * Get the innerHTML value of a xpath node
     * This function always returns a string
     * @param xpath
     * @private
     */
    private static getHtmlElementValue(xpath: string): string | null {
        const result = document.evaluate(`string(${xpath})`, document, null, XPathResult.STRING_TYPE, null);
        return result.stringValue
    }
}

/**
 * A class to fetch IndexedDB content
 */
class DBFetcher {
    private readonly dbName: string;
    private db: Dexie | null;
    private snapshot: DBSnapshot | undefined;

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

    /**
     * Get all DB content
     */
    public async getAll(): Promise<DBContent | null> {
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

const fetcher = new DAppStateFetcher();
fetcher.start();
