/*
This file defines test oracles for on-chain-off-chain synchronization bugs
 */
import {LogicalTxState, TransactionLog} from "./analyzer";
import {ConsoleErrorMsg, ContractVulReport, DBContent, TableContent, TxErrorMsg,} from "@darcher/rpc";
import * as _ from "lodash";
import {prettifyHash} from "@darcher/helpers";
import {$enum} from "ts-enum-util";

export enum VulnerabilityType {
    ContractVulnerability = "ContractVulnerability",
    ConsoleError = "ConsoleError",
    TransactionError = "TransactionError",
    DataInconsistency = "DataInconsistency",
    UnreliableTxHash = "UnreliableTxHash"
}

/**
 * Each oracle instance should only be used for one transaction.
 */
export interface Oracle {

    /**
     * should return whether this transaction's execution violates the oracle (is buggy)
     */
    isBuggy(): boolean;

    getBugReports(): Report[];

    /**
     * This method should be called only when transaction is at each transaction state.
     * @param txState The transaction state that transaction is currently at
     * @param dbContent The database content (after change in response to the transaction state) in dapp
     * @param txErrors The tx execution error during this tx state
     * @param contractVulReports The contract vulnerability reports during this transaction state
     * @param consoleErrors The dapp console errors during this transaction state
     * @param dappStack
     */
    onTxState(txState: LogicalTxState,
              dbContent: DBContent,
              txErrors: TxErrorMsg[],
              contractVulReports: ContractVulReport[],
              consoleErrors: ConsoleErrorMsg[],
              dappStack?: string[]): void;
}

export enum Severity {
    Low,
    Medium,
    High,
}

export interface Report {
    txHash(): string;

    type(): VulnerabilityType;

    message(): string;

    severity(): Severity
}

export function analyzeTransactionLog(oracle: Oracle, log: TransactionLog): Report[] {
    function loadDBContent(obj: DBContent.AsObject): DBContent {
        let content = new DBContent();
        let tablesMap = obj['tablesMap'];
        for (let table of tablesMap) {
            let tableContent = new TableContent();
            tableContent.setKeypathList(table[1].keypathList);
            tableContent.setEntriesList(table[1].entriesList);
            content.getTablesMap().set(table[0], tableContent);
        }
        return content;
    }

    function loadTxErrorMsg(obj: TxErrorMsg.AsObject): TxErrorMsg {
        return new TxErrorMsg()
            .setHash(obj.hash)
            .setType(obj.type)
            .setDescription(obj.description);
    }

    function loadConsoleErrorMsg(obj: ConsoleErrorMsg.AsObject): ConsoleErrorMsg {
        return new ConsoleErrorMsg()
            .setDappName(obj.dappName)
            .setErrorString(obj.errorString)
            .setInstanceId(obj.instanceId);
    }

    function loadContractVulReport(obj: ContractVulReport.AsObject): ContractVulReport {
        return new ContractVulReport()
            .setAddress(obj.address)
            .setDescription(obj.description)
            .setFuncSig(obj.funcSig)
            .setOpcode(obj.opcode)
            .setPc(obj.pc)
            .setTxHash(obj.txHash)
            .setType(obj.type);
    }

    for (const s of [LogicalTxState.CREATED, LogicalTxState.PENDING, LogicalTxState.EXECUTED, LogicalTxState.REMOVED, LogicalTxState.REEXECUTED, LogicalTxState.CONFIRMED]) {
        const state = log.states[s];
        oracle.onTxState(
            s,
            loadDBContent(state.dbContent),
            state.txErrors.map(item => loadTxErrorMsg(item)),
            state.contractVulReports.map(item => loadContractVulReport(item)),
            state.consoleErrors.map(item => loadConsoleErrorMsg(item)),
            log.stack,
        );
    }
    return oracle.getBugReports();
}

/**
 * Database change oracle
 * 1. DBContent in tx pending state should be equal to that in tx removed state (High).
 * 2. DBContent should not be changed in pending state (Low).
 */
export class DBChangeOracle implements Oracle {
    private readonly txHash: string;
    private readonly contentMap: { [txState in LogicalTxState]: DBContent };
    private readonly filter: DBContentDiffFilter;

    constructor(txHash: string, filter: DBContentDiffFilter = {}) {
        this.txHash = txHash;
        this.contentMap = {
            [LogicalTxState.CREATED]: null,
            [LogicalTxState.PENDING]: null,
            [LogicalTxState.EXECUTED]: null,
            [LogicalTxState.REMOVED]: null,
            [LogicalTxState.REEXECUTED]: null,
            [LogicalTxState.CONFIRMED]: null,
            [LogicalTxState.DROPPED]: null,
        };
        this.filter = filter ? filter : {};
    }

    getBugReports(): Report[] {
        let reports: Report[] = [];
        // we will consider DBContent at CREATED state to be the base-line
        let base: DBContent = this.contentMap[LogicalTxState.CREATED];
        let pending: DBContent = this.contentMap[LogicalTxState.PENDING];
        let confirmed: DBContent = this.contentMap[LogicalTxState.CONFIRMED];
        let createdConfirmedDiff: DBContentDiff = new DBContentDiff(base, confirmed, this.filter);
        let pendingConfirmedDiff: DBContentDiff = new DBContentDiff(pending, confirmed, this.filter);
        if (!createdConfirmedDiff.zero() && !pendingConfirmedDiff.zero()) {
            // DBContent at pending state should not be equal with confirmed state if created state and confirmed state is different.
            reports.push(new UnreliableTxHashReport(
                this.txHash,
                LogicalTxState.PENDING,
                pendingConfirmedDiff,
            ))
        }
        let removed: DBContent = this.contentMap[LogicalTxState.REMOVED];
        let removedDiff = new DBContentDiff(pending, removed, this.filter);
        if (!removedDiff.zero()) {
            // DBContent in tx pending state should be equal to that in tx removed state (High).
            reports.push(new DataInconsistencyReport(
                this.txHash,
                LogicalTxState.REMOVED,
                removedDiff,
            ))
        }
        return reports;
    }

    isBuggy(): boolean {
        return this.getBugReports().length > 0;
    }

    onTxState(txState: LogicalTxState,
              dbContent: DBContent,
              txErrors: TxErrorMsg[],
              contractVulReports: ContractVulReport[],
              consoleErrors: ConsoleErrorMsg[],
              dappStack: string[]): void {
        this.contentMap[txState] = dbContent;
    }
}

/**
 * Bug reports for UnreliableTxHash type. Persistent changes shouldn't be made at pending state
 */
class UnreliableTxHashReport implements Report {
    private readonly _txHash: string;
    private readonly dbContentDiff: DBContentDiff;
    private readonly txState: LogicalTxState;

    constructor(txHash: string, txState: LogicalTxState, dbContentDiff: DBContentDiff) {
        this._txHash = txHash;
        this.dbContentDiff = dbContentDiff;
        this.txState = txState;
    }

    severity(): Severity {
        return Severity.Low;
    }

    txHash(): string {
        return this._txHash;
    }

    type(): VulnerabilityType {
        return VulnerabilityType.UnreliableTxHash;
    }

    message(): string {
        // TODO print more information
        return `[${VulnerabilityType.UnreliableTxHash}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}}`;
    }

}

/**
 * Bug reports for DataInconsistency type
 */
class DataInconsistencyReport implements Report {
    private readonly _txHash: string;
    private readonly dbContentDiff: DBContentDiff;
    private readonly txState: LogicalTxState;

    constructor(txHash: string, txState: LogicalTxState, dbContentDiff: DBContentDiff) {
        this._txHash = txHash;
        this.dbContentDiff = dbContentDiff;
        this.txState = txState;
    }

    severity(): Severity {
        return Severity.High;
    }

    txHash(): string {
        return this._txHash;
    }

    type(): VulnerabilityType {
        return VulnerabilityType.DataInconsistency;
    }

    message(): string {
        // TODO print more information
        return `[${VulnerabilityType.DataInconsistency}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}
        DB Difference: 
        ${this.dbContentDiff.report}`;
    }

}

export type FieldPathSet = (string | RegExp)[][] | string[];

export interface TableContentDiffFilter {
    // specify the fields needed to compare in DBContents, if not specified, compare all
    includes?: FieldPathSet;
    // specify the fields needed to be excluded from comparison, if not specified, exclude none
    // rules in excludes can exclude the fields specified in includes
    excludes?: FieldPathSet;
}

export interface DBContentDiffFilter {
    [tableName: string]: TableContentDiffFilter;
}


/**
 * This class represent the difference between two DBContent instance.
 */
export class DBContentDiff {
    public readonly from: DBContent;
    public readonly to: DBContent;
    private readonly filter: DBContentDiffFilter;

    private _tableDiffs: { [tableName: string]: TableContentDiff };

    constructor(from: DBContent, to: DBContent, filter: DBContentDiffFilter = {}) {
        this.from = from;
        this.to = to;
        this.filter = filter;
        this.calDiff();
    }

    /**
     * Calculate the difference between two DBContent instance.
     */
    private calDiff() {
        this._tableDiffs = {};
        this.from.getTablesMap().forEach((fromTable, tableName) => {
            if (!this.to.getTablesMap().has(tableName)) {
                // for now, we suppose no table will be created or deleted during execution
                return;
            }
            let toTable = this.to.getTablesMap().get(tableName);
            this._tableDiffs[tableName] = new TableContentDiff(tableName, fromTable, toTable, this.filter[tableName]);
        });
    }

    /**
     * Whether no difference or not
     */
    public zero(): boolean {
        return _.values(this._tableDiffs).every(value => value.zero());
    }

    get tableDiffs(): { [tableName: string]: TableContentDiff } {
        return this._tableDiffs;
    }

    get report(): string {
        let report = '';
        for (let table in this.tableDiffs) {
            if (this.tableDiffs.hasOwnProperty(table)) {
                report += `$table: ${table}
                added: ${"\n\t" + this.tableDiffs[table].addedRecords.map(record => record.report).join("\n\t") + "\n"}
                deleted: ${"\n\t" + this.tableDiffs[table].deletedRecords.map(record => record.report).join("\n\t") + "\n"}
                changed: ${"\n\t" + this.tableDiffs[table].changedRecords.map(record => record.report).join("\n\t") + "\n"}`
            }
        }
        return report;
    }
}

/**
 * This class represent the difference between two TableContent instance (must be with same table name).
 */
export class TableContentDiff {
    public readonly tableName: string;
    public readonly from: TableContent;
    public readonly to: TableContent;

    private _deletedRecords: TableRecord[];
    private _addedRecords: TableRecord[];
    private _changedRecords: TableRecordChange[];
    private readonly filter: TableContentDiffFilter;

    constructor(tableName: string, from: TableContent, to: TableContent, filter: TableContentDiffFilter = {}) {
        this.tableName = tableName;
        this.from = from;
        this.to = to;
        this.filter = filter ? filter : {};
        this.calDiff();
    }

    /**
     * Calculate the difference between two TableContent instance.
     */
    private calDiff() {
        let fromRecords: TableRecord[] = [];
        let toRecords: TableRecord[] = [];
        // convert to list of TableRecord
        for (let f_r of this.from.getEntriesList()) {
            fromRecords.push(new TableRecord(this.from.getKeypathList(), f_r, this.filter));
        }
        for (let t_r of this.to.getEntriesList()) {
            toRecords.push(new TableRecord(this.to.getKeypathList(), t_r, this.filter));
        }

        // calculate diff
        this._deletedRecords = _.differenceWith(fromRecords, toRecords, (f, t) => f.sameKeyAs(t));
        this._addedRecords = _.differenceWith(toRecords, fromRecords, (f, t) => f.sameKeyAs(t));
        this._changedRecords = [];
        for (let f of fromRecords) {
            for (let t of toRecords) {
                if (f.sameKeyAs(t) && !f.equalTo(t)) {
                    // changed records are those with same key but not equal
                    this._changedRecords.push(new TableRecordChange(f, t));
                }
            }
        }
    }

    /**
     * Whether no difference or not
     */
    public zero(): boolean {
        return this._addedRecords.length === 0 && this._deletedRecords.length === 0 && this._changedRecords.length === 0;
    }

    get deletedRecords(): TableRecord[] {
        return this._deletedRecords;
    }

    get addedRecords(): TableRecord[] {
        return this._addedRecords;
    }

    get changedRecords(): TableRecordChange[] {
        return this._changedRecords;
    }
}

/**
 * The change of two records
 */
export class TableRecordChange {
    public readonly from: TableRecord;
    public readonly to: TableRecord;

    constructor(from: TableRecord, to: TableRecord) {
        this.from = from;
        this.to = to;
    }

    get report(): string {
        const jsondiffpatch = require("jsondiffpatch");
        let delta = jsondiffpatch.diff(this.from.filteredData, this.to.filteredData)
        return jsondiffpatch.formatters.console.format(delta);
    }
}

/**
 * One entry in each table
 */
export class TableRecord {
    public readonly keyPath: string[];
    public readonly data: { [key: string]: any };
    private readonly filter: TableContentDiffFilter;

    constructor(keyPath: string[], data: object | string, filter: TableContentDiffFilter = {}) {
        this.keyPath = keyPath;
        switch (typeof data) {
            case "string":
                // unmarshal json if data is a string
                this.data = JSON.parse(data);
                break;
            default:
                this.data = data;
                break;
        }
        this.filter = filter ? filter : {};
    }

    /**
     * If another TableRecord has the same key as this.
     * @param another
     */
    public sameKeyAs(another: TableRecord): boolean {
        if (!_.isEqual(this.keyPath.sort(), another.keyPath.sort())) {
            // short circuit if they have different key path
            return false;
        }
        for (let key of this.keyPath) {
            if (this.data[key] === undefined || another.data[key] === undefined) {
                // this branch should not happen, because key must be set
                return false;
            }
            // all key must be the same
            if (!_.isEqual(this.data[key], another.data[key])) {
                return false;
            }
        }
        return true;
    }

    get filteredData(): { [key: string]: any } {
        let thisData = _.cloneDeep(this.data);
        // delete the fields specified in exclusion
        const deleteField = (data: { [key: string]: any }, excludePath: (string | RegExp)[]) => {
            for (let key of Object.keys(data)) {
                let reg = new RegExp(excludePath[0]);
                if (!reg.test(key)) {
                    continue;
                }
                if (data.hasOwnProperty(key)) {
                    if (excludePath.length == 1) {
                        // end of exclude path, delete the field
                        delete data[key];
                    } else {
                        deleteField(data[key], excludePath.slice(1));
                    }
                }
            }
        };
        const addField = (data: { [key: string]: any }, selectPath: (string | RegExp)[], reference: { [key: string]: any }) => {
            for (let key of Object.keys(reference)) {
                let reg = new RegExp(selectPath[0]);
                if (!reg.test(key)) {
                    continue;
                }
                if (reference.hasOwnProperty(key)) {
                    if (selectPath.length == 1) {
                        // end of include path, add the field
                        data[key] = reference[key];
                    } else {
                        if (!data.hasOwnProperty(key)) {
                            data[key] = {};
                        }
                        addField(data[key], selectPath.slice(1), reference[key]);
                    }
                }
            }
        };

        const selectFields = (data: { [key: string]: string }, includes: FieldPathSet): { [key: string]: string } => {
            if (!includes) {
                // if includes are not specified, include all
                return _.cloneDeep(data);
            }
            let newData = {};

            for (let include of includes) {
                if (typeof include === "string") {
                    include = include.split(".");
                }
                addField(newData, include, data);
            }

            return newData;
        }

        if (this.filter.includes) {
            // includes are specified, we construct thisData and anotherData using included fields
            thisData = selectFields(thisData, this.filter.includes);
        }

        if (this.filter.excludes) {
            for (let exclude of this.filter.excludes) {
                if (typeof exclude === "string") {
                    exclude = exclude.split(".");
                }
                deleteField(thisData, exclude);
            }
        }
        return thisData;
    }

    public equalTo(another: TableRecord): boolean {
        return _.isEqual(this.keyPath.sort(), another.keyPath.sort()) && _.isEqual(this.filteredData, another.filteredData);
    }

    get report(): string {
        return JSON.stringify(this.filteredData)
    }
}

/**
 * TxError oracle
 * 1. transaction should be already checked before being sent by DApp and should not fail. (Medium)
 */
export class TxErrorOracle implements Oracle {
    private readonly txHash: string;
    private readonly txErrorMap: { [txState in LogicalTxState]: TxErrorMsg[] }

    constructor(txHash: string) {
        this.txHash = txHash;
        this.txErrorMap = {
            [LogicalTxState.CREATED]: [],
            [LogicalTxState.PENDING]: [],
            [LogicalTxState.EXECUTED]: [],
            [LogicalTxState.REMOVED]: [],
            [LogicalTxState.REEXECUTED]: [],
            [LogicalTxState.CONFIRMED]: [],
            [LogicalTxState.DROPPED]: [],
        };
    }

    getBugReports(): Report[] {
        let reports: Report[] = [];
        for (let state of $enum(LogicalTxState).getValues()) {
            for (let txErrorMsg of this.txErrorMap[state]) {
                reports.push(new TxErrorReport(
                    this.txHash,
                    state,
                    txErrorMsg
                ));
            }
        }
        return reports;
    }

    isBuggy(): boolean {
        for (let state of $enum(LogicalTxState).getValues()) {
            if (this.txErrorMap[state].length > 0) {
                return true;
            }
        }
        return false;
    }

    onTxState(txState: LogicalTxState,
              dbContent: DBContent,
              txErrors: TxErrorMsg[],
              contractVulReports: ContractVulReport[],
              consoleErrors: ConsoleErrorMsg[],
              dappStack: string[]): void {
        this.txErrorMap[txState].push(...txErrors);
    }

}

/**
 * Bug reports for TxError type
 */
class TxErrorReport implements Report {
    private readonly _txHash: string;
    private readonly errorMsg: TxErrorMsg;
    private readonly txState: LogicalTxState;

    constructor(txHash: string, txState: LogicalTxState, errorMsg: TxErrorMsg) {
        this._txHash = txHash;
        this.txState = txState;
        this.errorMsg = errorMsg;
    }

    type(): VulnerabilityType {
        return VulnerabilityType.TransactionError;
    }

    severity(): Severity {
        return Severity.Medium;
    }

    txHash(): string {
        return this._txHash;
    }

    message(): string {
        return `[${VulnerabilityType.TransactionError}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}: ${this.errorMsg.getDescription()}`;
    }
}

export class ContractVulnerabilityOracle implements Oracle {
    private readonly txHash: string;
    private readonly contractVulMap: { [txState in LogicalTxState]: ContractVulReport[] }

    constructor(txHash: string) {
        this.txHash = txHash;
        this.contractVulMap = {
            [LogicalTxState.CREATED]: [],
            [LogicalTxState.PENDING]: [],
            [LogicalTxState.EXECUTED]: [],
            [LogicalTxState.REMOVED]: [],
            [LogicalTxState.REEXECUTED]: [],
            [LogicalTxState.CONFIRMED]: [],
            [LogicalTxState.DROPPED]: [],
        }
    }

    getBugReports(): Report[] {
        let reports: Report[] = [];
        for (let state of $enum(LogicalTxState).getValues()) {
            for (let contractVulMsg of this.contractVulMap[state]) {
                reports.push(new ContractVulnerabilityReport(
                    this.txHash,
                    state,
                    contractVulMsg,
                ));
            }
        }
        return reports;
    }

    isBuggy(): boolean {
        for (let state of $enum(LogicalTxState).getValues()) {
            if (this.contractVulMap[state].length > 0) {
                return true;
            }
        }
        return false;
    }

    onTxState(txState: LogicalTxState,
              dbContent: DBContent,
              txErrors: TxErrorMsg[],
              contractVulReports: ContractVulReport[],
              consoleErrors: ConsoleErrorMsg[],
              dappStack: string[]): void {
        this.contractVulMap[txState].push(...contractVulReports);
    }

}

/**
 * Bug reports for ContractVulnerability type
 */
class ContractVulnerabilityReport implements Report {
    private readonly _txHash: string;
    private readonly contractVulReport: ContractVulReport;
    private readonly txState: LogicalTxState;

    constructor(txHash: string, txState: LogicalTxState, contractVulReport: ContractVulReport) {
        this._txHash = txHash;
        this.contractVulReport = contractVulReport;
        this.txState = txState;
    }

    severity(): Severity {
        return Severity.High;
    }

    txHash(): string {
        return this._txHash;
    }

    type(): VulnerabilityType {
        return VulnerabilityType.ContractVulnerability;
    }

    message(): string {
        return `[${VulnerabilityType.ContractVulnerability}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}: ${this.contractVulReport.getDescription()}`;
    }

}

export class ConsoleErrorOracle implements Oracle {
    private readonly txHash: string;
    private readonly consoleErrorMap: { [txState in LogicalTxState]: ConsoleErrorMsg[] }

    constructor(txHash: string) {
        this.txHash = txHash;
        this.consoleErrorMap = {
            [LogicalTxState.CREATED]: [],
            [LogicalTxState.PENDING]: [],
            [LogicalTxState.EXECUTED]: [],
            [LogicalTxState.REMOVED]: [],
            [LogicalTxState.REEXECUTED]: [],
            [LogicalTxState.CONFIRMED]: [],
            [LogicalTxState.DROPPED]: [],
        }
    }

    getBugReports(): Report[] {
        let reports: Report[] = [];
        for (let state of $enum(LogicalTxState).getValues()) {
            for (let consoleErrorMsg of this.consoleErrorMap[state]) {
                reports.push(new ConsoleErrorReport(
                    this.txHash,
                    state,
                    consoleErrorMsg,
                ));
            }
        }
        return reports;
    }

    isBuggy(): boolean {
        for (let state of $enum(LogicalTxState).getValues()) {
            if (this.consoleErrorMap[state].length > 0) {
                return true;
            }
        }
        return false;
    }

    onTxState(txState: LogicalTxState,
              dbContent: DBContent,
              txErrors: TxErrorMsg[],
              contractVulReports: ContractVulReport[],
              consoleErrors: ConsoleErrorMsg[],
              dappStack: string[]): void {
        this.consoleErrorMap[txState].push(...consoleErrors);
    }

}

/**
 * Bug reports for ConsoleError type
 */
class ConsoleErrorReport implements Report {
    private readonly _txHash: string;
    private readonly consoleError: ConsoleErrorMsg;
    private readonly txState: LogicalTxState;

    constructor(txHash: string, txState: LogicalTxState, consoleErrorMsg: ConsoleErrorMsg) {
        this._txHash = txHash;
        this.consoleError = consoleErrorMsg;
        this.txState = txState;
    }

    severity(): Severity {
        return Severity.Low;
    }

    txHash(): string {
        return this._txHash;
    }

    type(): VulnerabilityType {
        return VulnerabilityType.ConsoleError;
    }

    message(): string {
        return `[${VulnerabilityType.ConsoleError}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}: ${this.consoleError.getErrorString()}`;
    }

}
