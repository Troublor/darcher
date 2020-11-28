import * as _ from "lodash";

export enum MsgType {
    REQUEST = "request",
    TEST = "test",
}

// sent from background to content-script
export interface RequestMsg {
    type: MsgType.REQUEST
    requestType: "indexedDB" | "html"

    // indexedDB type fields
    dbName?: string

    // html type fields
    elements?: { name: string, xpath: string }[]
}

// sent from popup to background for test purposes
export interface TestMsg {
    type: MsgType.TEST
    testType: "fetch-html" | "refresh" | "tabs"

    address?: string
    // "fetch-html" type fields
    elements?: { name: string, xpath: string }[]
}


interface Change {
    key: any
    from: { [k: string]: object } | null
    to: { [k: string]: object } | null
}

export type DBChange = { [tableName: string]: TableChange }

export type TableChange = Change[];

export type DBSnapshot = { [tableName: string]: TableSnapshot }

export class TableSnapshot {
    private readonly content: object[];
    private readonly primaryKeys: any[];
    private readonly keyPath: string | string[];

    constructor(keyPath: string | string[], content: object[], primaryKeys: any) {
        this.content = content;
        this.primaryKeys = primaryKeys;
        this.keyPath = keyPath;
    }

    public static getChange(from: TableSnapshot, to: TableSnapshot): TableChange {
        let changes: TableChange = [];
        for (let key of from.primaryKeys) {
            if (to.primaryKeys.find(item => _.isEqual(key, item)) === undefined) {
                // the key has been deleted
                changes.push(<Change>{
                    key: key,
                    from: from.getContent(key),
                    to: null,
                })
            } else {
                // check whether modified
                if (!_.isEqual(from.getContent(key), to.getContent(key))) {
                    changes.push(<Change>{
                        key: key,
                        from: from.getContent(key),
                        to: to.getContent(key),
                    })
                }
            }
        }
        for (let key of to.primaryKeys) {
            if (from.primaryKeys.find(item => _.isEqual(key, item)) === undefined) {
                // the key is newly added
                changes.push(<Change>{
                    key: key,
                    from: null,
                    to: to.getContent(key),
                })
            }
        }
        return changes;
    }

    private getContent(key: any): object | undefined {
        // if key path is array, the key must be an array with same length
        if (Array.isArray(this.keyPath)) {
            if (!Array.isArray(key)) {
                return undefined;
            }
            if (key.length !== this.keyPath.length) {
                return undefined;
            }
        }
        return this.content.find(item => {
            if (Array.isArray(this.keyPath)) {
                for (let i in this.keyPath) {
                    if (!_.isEqual(item[this.keyPath[i]], key[i])) {
                        return false
                    }
                }
                return true;
            } else {
                return _.isEqual(item[this.keyPath], key);
            }
        });
    }
}

export interface Config {
    mode: "indexedDB" | "html"
    address: string
}

export interface HtmlModeConfig extends Config {
    mode: "html",
    elements: { name: string, xpath: string }[]
}
