import {
    allLogicalTxStates,
    ConsoleErrorOracle,
    ContractVulnerabilityOracle, DBContentDiffFilter,
    Oracle,
    TxErrorOracle
} from "@darcher/analyzer";
import {analyzeTransactionLog, DBChangeOracle, Report} from "@darcher/analyzer";
import {TransactionLog} from "@darcher/analyzer";
import * as fs from "fs";
import * as path from "path";

const logFile = path.join(__dirname, "..", "packages", "darcher-examples", "giveth", "data", "Giveth1", "0xb74a383eef2a57b56a805ba0301315b66b454cbb5e8dae7ae92599ec891fe65b.json");
const dbFilter: DBContentDiffFilter = {
    "*": {
        excludes: [
            "blockNumber",
            "date",
            "prevStatus",
            ["token", "prevStatus"],
            ["token", "updatedAt"],
            ["token", "createdAt"],
        ],
    },
    "conversations": {
        includes: [],
    },
    "conversionrates": {
        includes: [],
    }
};

const logContent = fs.readFileSync(logFile);
const log = JSON.parse(logContent.toString()) as TransactionLog;
console.info("Processing", log.hash);

const reports: Report[] = [];
const oracles: object[] = [
    new DBChangeOracle(log.hash, dbFilter),
    new ConsoleErrorOracle(log.hash),
    new TxErrorOracle(log.hash),
    new ContractVulnerabilityOracle(log.hash),
];

oracles.forEach(oracle => reports.push(...analyzeTransactionLog(oracle as Oracle, log)));
console.log(reports)
