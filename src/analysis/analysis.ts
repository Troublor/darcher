import {CRUDOperation, DAppStateChangeMsg, isDeepEqual, isNullOrUndefined, LifecycleState} from "../common";
import * as fs from "fs";

type StateChange = DAppStateChangeMsg;

interface MultipleRecords {
    total: number,
    limit: number,
    skip: number,
    data: object[],
}

interface UpdateEntry {
    From: object
    To: object
    Timestamp: number
    Operation: CRUDOperation
}

export class TxAnalysis {
    private isConfirmed: boolean = false;
    private txStateEntries: { [txState: string]: UpdateEntry[] }
    private txHash: string;
    private _analyzed: boolean = false;

    constructor(txHash: string) {
        this.isConfirmed = false;
        this.txHash = txHash;
        this._analyzed = false;
        this.txStateEntries = {};
        this.txStateEntries[LifecycleState.CREATED] = [];
        this.txStateEntries[LifecycleState.PENDING] = [];
        this.txStateEntries[LifecycleState.EXECUTED] = [];
        this.txStateEntries[LifecycleState.REVERTED] = [];
        this.txStateEntries[LifecycleState.REEXECUTED] = [];
        this.txStateEntries[LifecycleState.CONFIRMED] = [];
    }

    public add(txState: LifecycleState, msg: DAppStateChangeMsg): void {
        if (msg.From !== null && msg.From.hasOwnProperty("total") && msg.From.hasOwnProperty("limit") && msg.From.hasOwnProperty("skip") && msg.From.hasOwnProperty("data")) {
            // msg is multiple data records
            let from: MultipleRecords = <MultipleRecords>msg.From;
            let to: MultipleRecords = <MultipleRecords>msg.To;
            let i = 0;
            for (; from && i < from.data.length; i++) {
                if (to && i < to.data.length) {
                    let entry = <UpdateEntry>{
                        From: from.data[i],
                        To: to.data[i],
                        Timestamp: msg.Timestamp,
                        Operation: msg.Operation,
                    };
                    this.txStateEntries[txState].push(entry);
                } else {
                    let entry = <UpdateEntry>{
                        From: from.data[i],
                        To: null,
                        Timestamp: msg.Timestamp,
                        Operation: msg.Operation,
                    };
                    this.txStateEntries[txState].push(entry);
                }
            }
            for (let j = i; to && j < to.data.length; j++) {
                let entry = <UpdateEntry>{
                    From: null,
                    To: to.data[i],
                    Timestamp: msg.Timestamp,
                    Operation: msg.Operation,
                };
                this.txStateEntries[txState].push(entry);
            }
        } else {
            let entry = <UpdateEntry>{
                From: msg.From,
                To: msg.To,
                Timestamp: msg.Timestamp,
                Operation: msg.Operation,
            };
            this.txStateEntries[txState].push(entry);
        }
        this.txStateEntries[txState].sort((a, b) => a.Timestamp - b.Timestamp);
    }

    public get(txState: LifecycleState) {
        return this.txStateEntries[txState];
    }

    public analyze(): boolean {
        this._analyzed = true;
        let stateTableSlices: { [state: string]: TableSlice } = {};
        for (let state in this.txStateEntries) {
            stateTableSlices[state] = TxAnalysis.mergeStateChanges(this.txStateEntries[state]);
        }
        // check before executed dapp state and after reverted dapp state
        let records1 = stateTableSlices[LifecycleState.EXECUTED].fromRecords;
        let records2 = stateTableSlices[LifecycleState.REVERTED].toRecords;
        if (!TxAnalysis.isIdenticalRecords(records1, records2)) {
            return false;
        }

        // check after executed dapp state and after re-executed dapp state
        records1 = stateTableSlices[LifecycleState.EXECUTED].toRecords;
        records2 = stateTableSlices[LifecycleState.REEXECUTED].toRecords;
        if (!TxAnalysis.isIdenticalRecords(records1, records2)) {
            return false;
        }
        return true;
    }

    private static isIdenticalRecords(records1: object[], records2: object[]): boolean {
        if (records1.length != records2.length) {
            return false;
        }
        for (let i = 0; i < records1.length; i++) {
            let exists = false;
            for (let j = 0; j < records2.length; j++) {
                if (isDeepEqual(records1[i], records2[j])) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                // some entry in records1 but not in records2
                return false;
            }
        }
        return true;
    }

    private static mergeStateChanges(stateEntries: UpdateEntry[]): TableSlice {
        let table: TableSlice = new TableSlice(null);
        for (let change of stateEntries) {
            table.applyStateChange(change);
        }
        return table;
    }

    // public static objectDifferentiate(from: object, to: object): ObjectDifference {
    //
    // }

    get analyzed(): boolean {
        return this._analyzed;
    }

    public export(path: string): void {
        fs.writeFileSync(path, JSON.stringify({
            txHash: this.txHash,
            txStateEntries: this.txStateEntries
        }, null, 2));
    }

    public static import(path: string): TxAnalysis {
        let json: { [key: string]: string | object } = fs.readFileSync(path).toJSON();
        let analysis = new TxAnalysis(<string>json["txHash"]);
        analysis.txStateEntries = <{ [txState: string]: UpdateEntry[] }>json["txStateEntries"];
        return analysis;
    }
}

class DatabaseSlice {
    public tables: { [name: string]: TableSlice };

    constructor() {
        this.tables = {};
    }

    public applyStateChange(change: StateChange) {

    }
}

class TableSlice {
    public readonly name: string;

    public readonly fromRecords: object[];

    public readonly toRecords: object[];

    constructor(name: string) {
        this.name = name;
        this.toRecords = [];
        this.fromRecords = [];
    }

    public applyStateChange(change: UpdateEntry) {
        for (let i = 0; i < this.toRecords.length; i++) {
            let r = this.toRecords[i];
            if (isDeepEqual(r, change.From)) {
                // update an already updated record
                this.toRecords[i] = change.To;
            }
        }
        if (change.From != null) {
            this.fromRecords.push(change.From);
        }
        if (change.To != null) {
            this.toRecords.push(change.To);
        }
    }
}

