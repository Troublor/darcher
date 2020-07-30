/*
This file defines test oracles for on-chain-off-chain synchronization bugs
 */
import {LogicalTxState} from "./analyzer";
import {ConsoleErrorMsg, ContractVulReport, DBContent, TxErrorMsg,} from "@darcher/rpc";

export enum OracleType {
    ContractVulnerability,
    ConsoleError,
    TransactionError,
    DataInconsistency,
}

/**
 * Each oracle instance should only be used for one transaction.
 */
export interface Oracle {
    /**
     * constructor for oracles, should provide a transaction hash
     * @param txHash
     */
    new(txHash: string): Oracle;

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

export interface Report {
    dappName: string;
    txHash: string;
    type: OracleType;
    message: string;

    toString(): string;
}