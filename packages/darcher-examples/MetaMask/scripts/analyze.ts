import {DBChangeOracle, DBContentDiffFilter, Report} from "@darcher/analyzer/src/oracle";
import {LogicalTxState, TransactionLog} from "@darcher/analyzer/src";
import {DBContent, TableContent} from "@darcher/rpc";
import * as fs from "fs";

const dbFilter: DBContentDiffFilter = {
    "storage": {
        includes: [
            "data.NetworkController",
            "data.CachedBalancesController",
            "data.IncomingTransactionsController",
            "data.TransactionsController",
        ],
        excludes: [
            ["data", "IncomingTransactionsController", "incomingTransactions", /.*/, "blockNumber"],
            ["data", "IncomingTransactionsController", "incomingTransactions", /.*/, "time"],
            ["data", "TransactionController", "transactions", /.*/, "time"],
            ["data", "TransactionController", "transactions", /.*/, "history"],
            ["data", "TransactionController", "transactions", /.*/, "submittedTime"],
            ["data", "TransactionController", "transactions", /.*/, "txReceipt", "blockHash"],
            ["data", "TransactionController", "transactions", /.*/, "txReceipt", "blockNumber"],
        ]
    }
}

interface DBContentObject {
    tablesMap: [
        string,
        {
            keypathList: string[],
            entriesList: string[]
        }
    ][]
}

function loadDBContent(obj: DBContentObject): DBContent {
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

function analyzeTransactionLog(log: TransactionLog): Report[] {
    let oracle = new DBChangeOracle(log.hash, dbFilter);
    oracle.onTxState(LogicalTxState.CREATED, loadDBContent(log.states[LogicalTxState.CREATED] as DBContentObject), [], [], []);
    oracle.onTxState(LogicalTxState.PENDING, loadDBContent(log.states[LogicalTxState.PENDING] as DBContentObject), [], [], []);
    oracle.onTxState(LogicalTxState.EXECUTED, loadDBContent(log.states[LogicalTxState.EXECUTED] as DBContentObject), [], [], []);
    oracle.onTxState(LogicalTxState.REMOVED, loadDBContent(log.states[LogicalTxState.REMOVED] as DBContentObject), [], [], []);
    oracle.onTxState(LogicalTxState.REEXECUTED, loadDBContent(log.states[LogicalTxState.REEXECUTED] as DBContentObject), [], [], []);
    oracle.onTxState(LogicalTxState.CONFIRMED, loadDBContent(log.states[LogicalTxState.CONFIRMED] as DBContentObject), [], [], []);
    return oracle.getBugReports();
}

const logContent = fs.readFileSync("/Users/troublor/workspace/darcher/packages/darcher-analyzer/data/2020-8-2 20:25:3/0x6478646ae86a6682c0c1d40b58473497b4025b276cc3064652f86c2600563baa.json");
const log = JSON.parse(logContent.toString()) as TransactionLog;
const reports = analyzeTransactionLog(log);
reports.forEach(report => console.log(report.message()));
