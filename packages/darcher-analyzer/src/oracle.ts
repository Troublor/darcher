/*
This file defines test oracles for on-chain-off-chain synchronization bugs
 */
import {LogicalTxState} from "./analyzer";
import {ConsoleErrorMsg, ContractVulReport, DBContent, TxErrorMsg,} from "@darcher/rpc";

export enum OracleType {
    ContractVulnerability = "ContractVulnerability",
    ConsoleError = "ConsoleError",
    TransactionError = "TransactionError",
    DataInconsistency = "DataInconsistency",
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
    dappName: string;
    txHash: string;
    type: OracleType;
    message: string;
    severity: Severity

    toString(): string;
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
        // we will consider DBContent at CREATED state to be the base-line
        // TODO apply oracle
        return [];
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
        // TODO apply oracle
        return [];
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
        // TODO apply oracles
        return [];
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
        // TODO apply oracles
        return [];
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