import {analyzeTransactionLog, DBChangeOracle, DBContentDiffFilter, Report} from "@darcher/analyzer/src/oracle";
import {TransactionLog} from "@darcher/analyzer/src";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import {ConsoleErrorOracle, ContractVulnerabilityOracle, Oracle, TxErrorOracle} from "@darcher/analyzer";

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

const dataDir = "/Users/troublor/workspace/darcher/packages/darcher-examples/MetaMask/data/2020-11-11=19:9:50";
let logs: TransactionLog[] = [];
const uniqueReports: Report[] = [];
for (const file of fs.readdirSync(dataDir)) {
    console.log("Analyze", file);
    const logContent = fs.readFileSync(path.join(dataDir, file));
    const log = JSON.parse(logContent.toString()) as TransactionLog;
    logs.push(log);
}

logs = logs.filter((value, index) => index === 0 || !logs.filter(v => v !== value).some(v => v.stack.toString() === value.stack.toString()));
logs.forEach(log => {
    const oracles: object[] = [
        new DBChangeOracle(log.hash, dbFilter),
        new ConsoleErrorOracle(log.hash),
        new TxErrorOracle(log.hash),
        new ContractVulnerabilityOracle(log.hash),
    ];
    oracles.forEach(oracle => uniqueReports.push(...analyzeTransactionLog(oracle as Oracle, log)))
});
console.log(uniqueReports)
