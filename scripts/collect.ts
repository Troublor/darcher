import {AnalysisReport} from "./analyze";
import * as fs from "fs";
import * as path from "path";

export function collectReport(report: AnalysisReport) {
    console.log("transactions", report.totalTransactions);
    console.log("functionalities", report.totalFunctionalities);
    console.log("Bug-I, transactions, detected", report.functionalities
        .map(value => value.BugTypeOneTxHashes.length)
        .reduce((previousValue, currentValue) => previousValue + currentValue, 0));
    console.log("Bug-I, functionalities, detected", report.functionalities
        .map(value => value.BugTypeOneTxHashes.length > 0 ? 1 : 0)
        .reduce((previousValue, currentValue) => previousValue + currentValue, 0));
    console.log("Bug-II, transactions, detected", report.functionalities
        .map(value => value.BugTypeTwoTxHashes.length)
        .reduce((previousValue, currentValue) => previousValue + currentValue, 0));
    console.log("Bug-II, functionalities, detected", report.functionalities
        .map(value => value.BugTypeTwoTxHashes.length > 0 ? 1 : 0)
        .reduce((previousValue, currentValue) => previousValue + currentValue, 0));
}

if (require.main === module) {
    const file = path.join(__dirname, "multisender.report.json");
    collectReport(JSON.parse(fs.readFileSync(file, {encoding: "utf-8"})));
}
