import {analyzeTransactionLog, DBChangeOracle, DBContentDiffFilter, Report} from "@darcher/analyzer/src/oracle";
import {TransactionLog} from "@darcher/analyzer/src";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import {ConsoleErrorOracle, ContractVulnerabilityOracle, Oracle, TxErrorOracle} from "@darcher/analyzer";

const dbFilter: DBContentDiffFilter = {}

const dataDir = path.join(__dirname, "..", "data", "Etheroll7", "transactions");

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
const analysisSet :any[]= [];
logs.forEach(log => {
    const reports: Report[] = [];
    const oracles: object[] = [
        new DBChangeOracle(log.hash, dbFilter),
        // new ConsoleErrorOracle(log.hash),
        new TxErrorOracle(log.hash),
        new ContractVulnerabilityOracle(log.hash),
    ];
    oracles.forEach(oracle => reports.push(...analyzeTransactionLog(oracle as Oracle, log)));
    analysisSet.push({
        log: log,
        reports: reports,
    })
});

// filter duplicate
const transactionGroups = _.groupBy(analysisSet, analysis => analysis.log.stack?.join("\n"));
console.log(transactionGroups);
