import {analyzeTransactionLog, DBChangeOracle, DBContentDiffFilter, Report} from "@darcher/analyzer/src/oracle";
import {TransactionLog} from "@darcher/analyzer/src";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import {ConsoleErrorOracle, ContractVulnerabilityOracle, Oracle, TxErrorOracle} from "@darcher/analyzer";

interface TransactionAnalysis {
    log: TransactionLog,
    reports: Report[],
}

const dbFilter: DBContentDiffFilter = {
    "*": {
        excludes: [
            "blockNumber",
        ]
    },
    "Rollback": {
        includes: [],
    },
    "SyncStatus": {
        includes: [],
    },
    "TimestampSet": {
        includes: [],
    },
    "TokenBalanceChangedRollup": {
        includes: [],
    },
    "WarpSync": {
        includes: [],
    },
    "WarpSyncCheckpoints": {
        includes: [],
    },
}

const dataDir = "/Users/troublor/workspace/darcher/packages/darcher-examples/augurproject/data/augur3/transactions";
let logs: TransactionLog[] = [];
const uniqueReports: Report[] = [];
for (const file of fs.readdirSync(dataDir)) {
    if (file.includes("console-errors") ||
        file.includes("DS_Store")) {
        continue;
    }
    console.log("Analyze", file);
    const logContent = fs.readFileSync(path.join(dataDir, file));
    const log = JSON.parse(logContent.toString()) as TransactionLog;
    if (log.stack.join("\n").includes("create")) {
        console.log(log.hash, log.stack)
    }
    logs.push(log);
}
const analysisSet: TransactionAnalysis[] = [];
// logs = logs.filter((value, index) => index === 0 || !logs.filter(v => v !== value).some(v => v.stack.toString() === value.stack.toString()));
logs.forEach(log => {
    const reports: Report[] = [];
    const oracles: object[] = [
        new DBChangeOracle(log.hash, dbFilter),
        // new ConsoleErrorOracle(log.hash),
        // new TxErrorOracle(log.hash),
        // new ContractVulnerabilityOracle(log.hash),
    ];
    oracles.forEach(oracle => reports.push(...analyzeTransactionLog(oracle as Oracle, log)));
    analysisSet.push({
        log: log,
        reports: reports,
    })
});

// filter duplicate
const transactionGroups = _.groupBy(analysisSet, analysis => analysis.log.stack.join("\n"));
console.log(transactionGroups);

