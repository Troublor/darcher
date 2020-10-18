import {analyzeTransactionLog, DBChangeOracle, DBContentDiffFilter, Report} from "@darcher/analyzer/src/oracle";
import {TransactionLog} from "@darcher/analyzer/src";
import * as fs from "fs";
import * as path from "path";

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
            ["data", "IncomingTransactionsController", "incomingTxLastFetchedBlocksByNetwork"],
            ["data", "TransactionController", "transactions", /.*/, "time"],
            ["data", "TransactionController", "transactions", /.*/, "history"],
            ["data", "TransactionController", "transactions", /.*/, "submittedTime"],
            ["data", "TransactionController", "transactions", /.*/, "txReceipt", "blockHash"],
            ["data", "TransactionController", "transactions", /.*/, "txReceipt", "blockNumber"],
        ]
    }
}

const dataDir = "/Users/troublor/workspace/darcher/packages/darcher-analyzer/data/2020-9-4 17:19:10"
for (const file of fs.readdirSync(dataDir)) {
    console.log("Analyze", file);
    const logContent = fs.readFileSync(path.join(dataDir, file));
    const log = JSON.parse(logContent.toString()) as TransactionLog;
    let oracle = new DBChangeOracle(log.hash, dbFilter);
    const reports = analyzeTransactionLog(oracle, log);
    reports.forEach(report => console.log(report.message()));
}

