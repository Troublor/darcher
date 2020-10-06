import {analyzeTransactionLog, DBChangeOracle, DBContentDiffFilter, Report} from "@darcher/analyzer/src/oracle";
import {TransactionLog} from "@darcher/analyzer/src";
import * as fs from "fs";

const dbFilter: DBContentDiffFilter = {
    "storage": {
        includes: [
            "data.NetworkController",
            "data.CachedBalancesController",
            "data.IncomingTransactionsController",
            "data.TransactionController",
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

const logContent = fs.readFileSync("/Users/troublor/workspace/darcher/packages/darcher-analyzer/data/2020-8-2 20:25:3/0x6478646ae86a6682c0c1d40b58473497b4025b276cc3064652f86c2600563baa.json");
const log = JSON.parse(logContent.toString()) as TransactionLog;
let oracle = new DBChangeOracle(log.hash, dbFilter);
const reports = analyzeTransactionLog(oracle, log)
reports.forEach(report => console.log(report.message()));
