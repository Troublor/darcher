/*
This file defines test oracles for on-chain-off-chain synchronization bugs
 */
import {LogicalTxState} from "./analyzer";
import {ConsoleErrorMsg, ContractVulReport, DBContent, TableContent, TxErrorMsg,} from "@darcher/rpc";
import * as _ from "lodash";
import {prettifyHash} from "@darcher/helpers";
import {$enum} from "ts-enum-util";

export enum OracleType {
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

    /**
     * getter for oracle type
     */
    type(): OracleType;

    getBugReports(): Report[];

    /**
     * This method should be called only when transaction is at each transaction state.
     * @param txState The transaction state that transaction is currently at
     * @param dbContent The database content (after change in response to the transaction state) in dapp
     * @param txErrors The tx execution error during this tx state
     * @param contractVulReports The contract vulnerability reports during this transaction state
     * @param consoleErrors The dapp console errors during this transaction state
     */
    onTxState(txState: LogicalTxState, dbContent: DBContent, txErrors: TxErrorMsg[], contractVulReports: ContractVulReport[], consoleErrors: ConsoleErrorMsg[]): void;
}

export enum Severity {
    Low,
    Medium,
    High,
}

export interface Report {
    txHash(): string;

    type(): OracleType;

    message(): string;

    severity(): Severity
}

/**
 * Database change oracle
 * 1. DBContent in tx pending state should be equal to that in tx removed state (High).
 * 2. DBContent should not be changed in pending state (Low).
 */
export class DBChangeOracle implements Oracle {
    private readonly txHash: string;
    private readonly contentMap: { [txState in keyof typeof LogicalTxState]: DBContent };

    constructor(txHash: string) {
        this.txHash = txHash;
        this.contentMap = {
            CREATED: null,
            PENDING: null,
            EXECUTED: null,
            REMOVED: null,
            REEXECUTED: null,
            CONFIRMED: null,
            DROPPED: null,
        };
    }

    getBugReports(): Report[] {
        let reports: Report[] = [];
        // we will consider DBContent at CREATED state to be the base-line
        let base: DBContent = this.contentMap[LogicalTxState.CREATED];
        let pending: DBContent = this.contentMap[LogicalTxState.PENDING];
        let pendingDiff = new DBContentDiff(base, pending);
        if (!pendingDiff.zero()) {
            // DBContent should not be changed in pending state (Low).
            reports.push(new UnreliableTxHashReport(
                this.txHash,
                LogicalTxState.PENDING,
                pendingDiff,
            ))
        }
        let removed: DBContent = this.contentMap[LogicalTxState.REMOVED];
        let removedDiff = new DBContentDiff(pending, removed);
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
        return false;
    }

    onTxState(txState: LogicalTxState, dbContent: DBContent, txErrors: TxErrorMsg[], contractVulReports: ContractVulReport[], consoleErrors: ConsoleErrorMsg[]): void {
        this.contentMap[txState] = dbContent;
    }

    type(): OracleType {
        return OracleType.DataInconsistency;
    }
}

/**
 * Bug reports for UnreliableTxHash type. Persistent changes shouldn't be made at pending state
 */
class UnreliableTxHashReport implements Report{
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

    type(): OracleType {
        return OracleType.UnreliableTxHash;
    }

    message(): string {
        // TODO print more information
        return `[${OracleType.UnreliableTxHash}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}}`;
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

    type(): OracleType {
        return OracleType.DataInconsistency;
    }

    message(): string {
        // TODO print more information
        return `[${OracleType.DataInconsistency}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}}`;
    }

}


/**
 * This class represent the difference between two DBContent instance.
 */
export class DBContentDiff {
    public readonly from: DBContent;
    public readonly to: DBContent;

    private _tableDiffs: { [tableName: string]: TableContentDiff };

    constructor(from: DBContent, to: DBContent) {
        this.from = from;
        this.to = to;
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
            this._tableDiffs[tableName] = new TableContentDiff(tableName, fromTable, toTable);
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

    constructor(tableName: string, from: TableContent, to: TableContent) {
        this.tableName = tableName;
        this.from = from;
        this.to = to;
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
            fromRecords.push(new TableRecord(this.from.getKeypathList(), f_r));
        }
        for (let t_r of this.to.getEntriesList()) {
            toRecords.push(new TableRecord(this.to.getKeypathList(), t_r));
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
}

/**
 * One entry in each table
 */
export class TableRecord {
    public readonly keyPath: string[];
    public readonly data: { [key: string]: any };

    constructor(keyPath: string[], data: object | string) {
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

    public equalTo(another: TableRecord): boolean {
        return _.isEqual(this.keyPath.sort(), another.keyPath.sort()) && _.isEqual(this.data, another.data);
    }
}

/**
 * TxError oracle
 * 1. transaction should be already checked before being sent by DApp and should not fail. (Medium)
 */
export class TxErrorOracle implements Oracle {
    private readonly txHash: string;
    private readonly txErrorMap: { [txState in keyof typeof LogicalTxState]: TxErrorMsg[] }

    constructor(txHash: string) {
        this.txHash = txHash;
        this.txErrorMap = {
            CREATED: [],
            PENDING: [],
            EXECUTED: [],
            REMOVED: [],
            REEXECUTED: [],
            CONFIRMED: [],
            DROPPED: [],
        };
    }

    getBugReports(): Report[] {
        let reports: Report[] = [];
        for (let state of $enum(LogicalTxState).getKeys()) {
            for (let txErrorMsg of this.txErrorMap[state]) {
                reports.push(new TxErrorReport(
                    this.txHash,
                    $enum(LogicalTxState).getValueOrDefault(state),
                    txErrorMsg
                ));
            }
        }
        return reports;
    }

    isBuggy(): boolean {
        for (let state in this.txErrorMap) {
            if (this.txErrorMap[state].length > 0) {
                return true;
            }
        }
        return false;
    }

    onTxState(txState: LogicalTxState, dbContent: DBContent, txErrors: TxErrorMsg[], contractVulReports: ContractVulReport[], consoleErrors: ConsoleErrorMsg[]): void {
        this.txErrorMap[txState].push(...txErrors);
    }

    type(): OracleType {
        return OracleType.TransactionError;
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

    type(): OracleType {
        return OracleType.TransactionError;
    }

    severity(): Severity {
        return Severity.Medium;
    }

    txHash(): string {
        return this._txHash;
    }

    message(): string {
        return `[${OracleType.TransactionError}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}: ${this.errorMsg.getDescription()}`;
    }
}

export class ContractVulnerabilityOracle implements Oracle {
    private readonly txHash: string;
    private readonly contractVulMap: { [txState in keyof typeof LogicalTxState]: ContractVulReport[] }

    constructor(txHash: string) {
        this.txHash = txHash;
        this.contractVulMap = {
            CREATED: [],
            PENDING: [],
            EXECUTED: [],
            REMOVED: [],
            REEXECUTED: [],
            CONFIRMED: [],
            DROPPED: [],
        }
    }

    getBugReports(): Report[] {
        let reports: Report[] = [];
        for (let state of $enum(LogicalTxState).getKeys()) {
            for (let contractVulMsg of this.contractVulMap[state]) {
                reports.push(new ContractVulnerabilityReport(
                    this.txHash,
                    $enum(LogicalTxState).getValueOrDefault(state),
                    contractVulMsg,
                ));
            }
        }
        return reports;
    }

    isBuggy(): boolean {
        for (let state in this.contractVulMap) {
            if (this.contractVulMap[state].length > 0) {
                return true;
            }
        }
        return false;
    }

    onTxState(txState: LogicalTxState, dbContent: DBContent, txErrors: TxErrorMsg[], contractVulReports: ContractVulReport[], consoleErrors: ConsoleErrorMsg[]): void {
        this.contractVulMap[txState].push(...contractVulReports);
    }

    type(): OracleType {
        return OracleType.ContractVulnerability;
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

    type(): OracleType {
        return OracleType.ContractVulnerability;
    }

    message(): string {
        return `[${OracleType.ContractVulnerability}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}: ${this.contractVulReport.getDescription()}`;
    }

}

export class ConsoleErrorOracle implements Oracle {
    private readonly txHash: string;
    private readonly consoleErrorMap: { [txState in keyof typeof LogicalTxState]: ConsoleErrorMsg[] }

    constructor(txHash: string) {
        this.txHash = txHash;
        this.consoleErrorMap = {
            CREATED: [],
            PENDING: [],
            EXECUTED: [],
            REMOVED: [],
            REEXECUTED: [],
            CONFIRMED: [],
            DROPPED: [],
        }
    }

    getBugReports(): Report[] {
        let reports: Report[] = [];
        for (let state of $enum(LogicalTxState).getKeys()) {
            for (let consoleErrorMsg of this.consoleErrorMap[state]) {
                reports.push(new ConsoleErrorReport(
                    this.txHash,
                    $enum(LogicalTxState).getValueOrDefault(state),
                    consoleErrorMsg,
                ));
            }
        }
        return reports;
    }

    isBuggy(): boolean {
        for (let state in this.consoleErrorMap) {
            if (this.consoleErrorMap[state].length > 0) {
                return true;
            }
        }
        return false;
    }

    onTxState(txState: LogicalTxState, dbContent: DBContent, txErrors: TxErrorMsg[], contractVulReports: ContractVulReport[], consoleErrors: ConsoleErrorMsg[]): void {
        this.consoleErrorMap[txState].push(...consoleErrors);
    }

    type(): OracleType {
        return OracleType.ConsoleError;
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

    type(): OracleType {
        return OracleType.ConsoleError;
    }

    message(): string {
        return `[${OracleType.ConsoleError}] Tx ${prettifyHash(this.txHash())} at ${$enum(LogicalTxState).getKeyOrDefault(this.txState, "unknown")}: ${this.consoleError.getErrorString()}`;
    }

}
