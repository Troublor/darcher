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
    TxErrorOracle, VulnerabilityType
} from "@darcher/analyzer";
import * as stream from "stream";

export interface Transaction {
    log: TransactionLog,
    reports: Report[],
}

export interface Functionality {
    stack: string[] | undefined,
    txHashes: string[],
    runtimeErrorTxHashes: string[],
    txErrorTxHashes: string[],
    vulnerabilityTxHashes: string[],
    BugTypeOneTxHashes: string[],
    BugTypeTwoTxHashes: string[],
}

export interface AnalysisReport {
    totalRuntimeError: number,
    totalFunctionalities: number,
    totalTransactions: number,
    functionalities: Functionality[]
}

export function analyzeAll(roundDirs: string[], dbFilter: DBContentDiffFilter, runtimeErrorFilter: string[], reportFile: string) {
// start analyze
    let transactionLogs: TransactionLog[] = [];
    let runtimeErrors: string[] = [];
    for (const roundDir of roundDirs) {
        console.log("Collecting round dir", roundDir);
        for (const file of fs.readdirSync(roundDir)) {
            if (file.includes("DS_Store")) {
                continue;
            }
            if (file === "console-errors.log") {
                console.log("Collecting runtime error");
                const data: string = fs.readFileSync(path.join(roundDir, "console-errors.log"), {encoding: "utf-8"});
                const totalRuntimeErrors = data.split("\n")
                    .filter(value => runtimeErrorFilter.every(filter => !value.includes(filter)))
                    .filter(value => value.length > 0);
                runtimeErrors.push(...totalRuntimeErrors);
            } else {
                console.log("Collecting transaction", file);
                const logContent = fs.readFileSync(path.join(roundDir, file));
                const log = JSON.parse(logContent.toString()) as TransactionLog;
                transactionLogs.push(log);
            }
        }
    }

    const analysisSet: Transaction[] = [];
    transactionLogs.forEach(log => {
        console.info("Processing", log.hash);
        for (const state of allLogicalTxStates) {
            const stateData = log.states[state]
            if (!stateData) {
                continue;
            }
            stateData.consoleErrors = stateData.consoleErrors
                .filter(value => runtimeErrorFilter.every(filter => !value.errorString.includes(filter)))
                .filter(value => value.errorString.length > 0);
        }

        if (!(
            log.states[LogicalTxState.CREATED] &&
            log.states[LogicalTxState.PENDING] &&
            log.states[LogicalTxState.EXECUTED] &&
            log.states[LogicalTxState.REMOVED] &&
            log.states[LogicalTxState.REEXECUTED] &&
            log.states[LogicalTxState.CONFIRMED]
        )) {
            console.info("Bad log", log.hash);
            return;
        }

        const reports: Report[] = [];
        const oracles: object[] = [
            new DBChangeOracle(log.hash, dbFilter),
            new ConsoleErrorOracle(log.hash),
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
    const transactionGroups = _.groupBy(analysisSet, analysis => {
        if (typeof analysis.log.stack === "string") {
            return analysis.log.stack;
        } else if (Array.isArray(analysis.log.stack)) {
            return analysis.log.stack?.join("\n");
        } else {
            return analysis.log.stack;
        }
    });

    const report: AnalysisReport = {
        totalRuntimeError: runtimeErrors.length,
        totalTransactions: transactionLogs.length,
        totalFunctionalities: Object.keys(transactionGroups).length,
        functionalities: [],
    };

    for (const stackStr in transactionGroups) {
        if (!transactionGroups.hasOwnProperty(stackStr)) {
            continue;
        }
        const group = transactionGroups[stackStr];
        const functionality: Functionality = {
            stack: stackStr.split("\n"),
            txHashes: group.map(analysis => analysis.log.hash),
            runtimeErrorTxHashes: group
                .filter(analysis => analysis.reports.some(r => r.type() === VulnerabilityType.ConsoleError))
                .map(analysis => analysis.log.hash),
            vulnerabilityTxHashes: group
                .filter(analysis => analysis.reports.some(r => r.type() === VulnerabilityType.ContractVulnerability))
                .map(analysis => analysis.log.hash),
            txErrorTxHashes: group
                .filter(analysis => analysis.reports.some(r => r.type() === VulnerabilityType.TransactionError))
                .map(analysis => analysis.log.hash),
            BugTypeOneTxHashes: group
                .filter(analysis => analysis.reports.some(r => r.type() === VulnerabilityType.UnreliableTxHash))
                .map(analysis => analysis.log.hash),
            BugTypeTwoTxHashes: group
                .filter(analysis => analysis.reports.some(r => r.type() === VulnerabilityType.DataInconsistency))
                .map(analysis => analysis.log.hash),
        };
        report.functionalities.push(functionality);
    }
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 4));
    console.log("Report generated", reportFile);
}

export function analyzeSingle(logFile: string, dbFilter: DBContentDiffFilter): Report[] {
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
    return reports;
}
