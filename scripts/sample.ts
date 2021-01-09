// random sample transactions for each functionality

import {AnalysisReport} from "./analyze";
import * as _ from "lodash";
import * as fs from "fs";

export interface SampledFunctionality {
    stack: string[],
    sampledTransactions: string[],
    bugType: "Bug-I" | "Bug-II";
}

export function sampleTransactions(report: AnalysisReport, sampleNum: number): SampledFunctionality[] {
    const samples: SampledFunctionality[] = [];
    for (const functionality of report.functionalities) {
        if (functionality.BugTypeOneTxHashes.length > 0) {
            if (functionality.BugTypeOneTxHashes.length <= sampleNum) {
                samples.push({
                    stack: functionality.stack,
                    bugType: "Bug-I",
                    sampledTransactions: functionality.BugTypeOneTxHashes,
                });
            } else {
                samples.push({
                    stack: functionality.stack,
                    bugType: "Bug-I",
                    sampledTransactions: _.sampleSize(functionality.BugTypeOneTxHashes, sampleNum),
                });
            }
        }
        if (functionality.BugTypeTwoTxHashes.length > 0) {
            if (functionality.BugTypeTwoTxHashes.length <= sampleNum) {
                samples.push({
                    stack: functionality.stack,
                    bugType: "Bug-II",
                    sampledTransactions: functionality.BugTypeTwoTxHashes,
                });
            } else {
                samples.push({
                    stack: functionality.stack,
                    bugType: "Bug-II",
                    sampledTransactions: _.sampleSize(functionality.BugTypeTwoTxHashes, sampleNum),
                });
            }
        }
    }
    return samples;
}

export function sample(reportFile: string, sampleNum: number, sampleFile: string) {
    const report: AnalysisReport = JSON.parse(fs.readFileSync(reportFile, {encoding: "utf-8"}));
    const samples = sampleTransactions(report, sampleNum);
    fs.writeFileSync(sampleFile, JSON.stringify(samples, null, 4));
}
