import * as _ from "lodash";

/* chrome extension message starts */

export enum ExtensionMsgType {
    SETTING,
    DATA,
}

export enum SettingMsgOperation {
    UPDATE,
    FETCH,
    REGISTER, // register that this is tab has dbMonitor running
}

export enum DataMsgOperation {
    GET_ALL
}

export interface ExtensionMsg {
    type: ExtensionMsgType
    operation: SettingMsgOperation | DataMsgOperation
}

export interface SettingMsg extends ExtensionMsg {
    type: ExtensionMsgType.SETTING
    operation: SettingMsgOperation
    domain: string
}

export interface DataMsg extends ExtensionMsg {
    type: ExtensionMsgType.DATA,
    operation: DataMsgOperation,
}

export interface GetAllDataMsg extends DataMsg {
    operation: DataMsgOperation.GET_ALL,
    dbName: string
    data: Uint8Array //dbContent: DBContent,
}

/* chrome extension message ends */


export enum dArcherControlType {
    GET_ALL,
    GET_CHANGE_IN_TIME_RANGE,
}

export interface dArcherControlMsg {
    type: dArcherControlType
    id: number
}

export interface GetChangeInTimeLimitMsg extends dArcherControlMsg {
    timeLimit: number
}

export interface dArcherControlReply {
    id: number
    data: any
    err: string
}

interface Change {
    key: any
    from: { [k: string]: object }
    to: { [k: string]: object }
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

