import {analyzeTransactionLog, DBChangeOracle, DBContentDiffFilter, Report} from "@darcher/analyzer/src/oracle";
import {LogicalTxState, TransactionLog} from "@darcher/analyzer/src";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import {
    allLogicalTxStates,
    ConsoleErrorOracle,
    ContractVulnerabilityOracle,
    Oracle,
    TxErrorOracle
} from "@darcher/analyzer";

interface TransactionAnalysis {
    log: TransactionLog,
    reports: Report[],
}

const dbFilter: DBContentDiffFilter = {
    "system.indexes": {
        includes: []
    },
}

const dataDir = path.join(__dirname, "..", "data", "eth-hot-wallet4", "transactions");
let logs: TransactionLog[] = [];
for (const file of fs.readdirSync(dataDir)) {
    if (file.includes("console-errors") ||
        file.includes("DS_Store")) {
        continue;
    }
    console.log("Analyze", file);
    const logContent = fs.readFileSync(path.join(dataDir, file));
    const log = JSON.parse(logContent.toString()) as TransactionLog;
    logs.push(log);
}


const analysisSet: TransactionAnalysis[] = [];
logs.forEach(log => {
    // filter out irrelevant runtime errors
    for (const state of allLogicalTxStates) {
        const stateData = log.states[state]
        if (!stateData) {
            continue;
        }
        stateData.consoleErrors = stateData.consoleErrors
            .filter(value => !value.errorString.includes("chrome-extension"))
            .filter(value => !value.errorString.includes("https://sentry.io"))
            .filter(valle => !valle.errorString.includes("chromeextension"));
    }

    const reports: Report[] = [];
    const oracles: object[] = [
        new DBChangeOracle(log.hash, dbFilter),
        // new ConsoleErrorOracle(log.hash),
        // new TxErrorOracle(log.hash),
        // new ContractVulnerabilityOracle(log.hash),
    ];
    console.info("Processing", log.hash)
    oracles.forEach(oracle => reports.push(...analyzeTransactionLog(oracle as Oracle, log)));
    analysisSet.push({
        log: log,
        reports: reports,
    })
});

// filter duplicate
const transactionGroups = _.groupBy(analysisSet, analysis => {
    if (typeof analysis.log.stack === "string") return analysis.log.stack;
    else if (Array.isArray(analysis.log.stack)) return analysis.log.stack.join("\n");
    else return undefined;
});
console.log(transactionGroups);

// check total runtime error
const data: string = fs.readFileSync(path.join(dataDir, "console-errors.log"), {encoding: "utf-8"});
const totalRuntimeErrors = data.split("\n")
    .filter(value => !value.includes("chrome-extension"))
    .filter(value => !value.includes("https://sentry.io"))
    .filter(value => !value.includes("favicon.ico"))
    .filter(value => !value.includes("ropsten.infura.io"))
    .filter(value => !value.includes("api.coinmarketcap.com"))
    .filter(value => value.length > 0)
    .filter(value => !value.includes("chromeextension"));
console.log(totalRuntimeErrors);
