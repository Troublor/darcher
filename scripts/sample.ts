// random sample transactions for each functionality

import {AnalysisReport} from "./analyze";
import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";

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

interface IdentifiableTransaction {
    dapp: string, // dapp name
    stack: string[], // functionality stack trace
    hash: string, // txHash with path to its experiment data dir
    bugType: "Bug-I" | "Bug-II",
}

export function samplePadding(reportFiles: string[], sampleFiles: string[], paddingAmount: [number, number], outDir: string) {
    const reports: { dapp: string, report: AnalysisReport; }[] = [];
    for (const reportFile of reportFiles) {
        reports.push({
            dapp: path.basename(reportFile).split(".")[0],
            report: JSON.parse(fs.readFileSync(reportFile, {encoding: "utf-8"})),
        })
    }
    const samples: { dapp: string, sample: SampledFunctionality[] }[] = [];
    for (const sampleFile of sampleFiles) {
        samples.push({
            dapp: path.basename(sampleFile).split(".")[0],
            sample: JSON.parse(fs.readFileSync(sampleFile, {encoding: "utf-8"})),
        });
    }
    const bugTypeOneAlreadySampledTxs: IdentifiableTransaction[] = [];
    const bugTypeTwoAlreadySampledTxs: IdentifiableTransaction[] = [];
    samples.forEach(sample => {
        sample.sample.forEach(fn => {
            if (fn.bugType === "Bug-I") {
                fn.sampledTransactions.forEach(hash => {
                    bugTypeOneAlreadySampledTxs.push({
                        dapp: sample.dapp,
                        stack: fn.stack,
                        hash: hash,
                        bugType: "Bug-I",
                    });
                });
            } else if (fn.bugType === "Bug-II") {
                fn.sampledTransactions.forEach(hash => {
                    bugTypeTwoAlreadySampledTxs.push({
                        dapp: sample.dapp,
                        stack: fn.stack,
                        hash: hash,
                        bugType: "Bug-II",
                    });
                });
            }
        });
    });
    const allBugTypeOneTxs: IdentifiableTransaction[] = [];
    const allBugTypeTwoTxs: IdentifiableTransaction[] = [];
    reports.forEach(report => {
        report.report.functionalities.forEach(fn => {
            fn.BugTypeOneTxHashes.forEach(hash => allBugTypeOneTxs.push({
                dapp: report.dapp,
                stack: fn.stack,
                hash: hash,
                bugType: "Bug-I",
            }));
            fn.BugTypeTwoTxHashes.forEach(hash => allBugTypeTwoTxs.push({
                dapp: report.dapp,
                stack: fn.stack,
                hash: hash,
                bugType: "Bug-II",
            }));
        });
    });

    const [bugTypeOnePaddingAmount, bugTypeTwoPaddingAmount] = paddingAmount;
    if (bugTypeOneAlreadySampledTxs.length < bugTypeOnePaddingAmount) {
        const paddingSize = bugTypeOnePaddingAmount - bugTypeOneAlreadySampledTxs.length;
        const padded = _.sampleSize(allBugTypeOneTxs.filter(tx => !bugTypeOneAlreadySampledTxs.some(t => t.hash === tx.hash)), paddingSize);
        bugTypeOneAlreadySampledTxs.push(...padded);
    }
    if (bugTypeTwoAlreadySampledTxs.length < bugTypeTwoPaddingAmount) {
        const paddingSize = bugTypeTwoPaddingAmount - bugTypeTwoAlreadySampledTxs.length;
        const padded = _.sampleSize(allBugTypeTwoTxs.filter(tx => !bugTypeTwoAlreadySampledTxs.some(t => t.hash === tx.hash)), paddingSize);
        bugTypeTwoAlreadySampledTxs.push(...padded);
    }

    const groupByDApp = _.groupBy([...bugTypeOneAlreadySampledTxs, ...bugTypeTwoAlreadySampledTxs], v => v.dapp);
    for (const dapp in groupByDApp) {
        if (!groupByDApp.hasOwnProperty(dapp)) {
            continue;
        }
        const samples: SampledFunctionality[] = [];
        const groupByBugType = _.groupBy(groupByDApp[dapp], tx => tx.bugType);
        for (const t in groupByBugType) {
            if (!groupByBugType.hasOwnProperty(t)) {
                continue;
            }
            const groupByFunctionality = _.groupBy(groupByBugType[t], tx => tx.stack.join("\n"));
            for (const s in groupByFunctionality) {
                if (!groupByFunctionality.hasOwnProperty(s)) {
                    continue;
                }
                const sample: SampledFunctionality = {
                    stack: s.split("\n"),
                    bugType: t as "Bug-I" | "Bug-II",
                    sampledTransactions: groupByFunctionality[s].map(tx => tx.hash),
                };
                samples.push(sample);
            }
        }

        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, {recursive: true});
        }
        fs.writeFileSync(path.join(outDir, `${dapp}.sample.json`), JSON.stringify(samples, null, 4));
        console.log(`${samples.length} functionalities ${samples.map(sample => sample.sampledTransactions.length).reduce((p, c) => p + c)} txs write to ${path.join(outDir, `${dapp}.sample.json`)}`);
    }

}

samplePadding([
    path.join(__dirname, "AgroChain.report.json"),
    path.join(__dirname, "augur.report.json"),
    path.join(__dirname, "burner-wallet.report.json"),
    path.join(__dirname, "democracy-earth.report.json"),
    path.join(__dirname, "eth-hot-wallet.report.json"),
    path.join(__dirname, "ethereum_voting_dapp.report.json"),
    path.join(__dirname, "ethereum-todolist.report.json"),
    path.join(__dirname, "giveth.report.json"),
    path.join(__dirname, "heiswap.report.json"),
    path.join(__dirname, "metamask.report.json"),
    path.join(__dirname, "multisender.report.json"),
    path.join(__dirname, "publicvotes.report.json"),
], [
    path.join(__dirname, "AgroChain.sample.json"),
    path.join(__dirname, "augur.sample.json"),
    path.join(__dirname, "burner-wallet.sample.json"),
    path.join(__dirname, "democracy-earth.sample.json"),
    path.join(__dirname, "eth-hot-wallet.sample.json"),
    path.join(__dirname, "ethereum_voting_dapp.sample.json"),
    path.join(__dirname, "ethereum-todolist.sample.json"),
    path.join(__dirname, "giveth.sample.json"),
    path.join(__dirname, "heiswap.sample.json"),
    path.join(__dirname, "metamask.sample.json"),
    path.join(__dirname, "multisender.sample.json"),
    path.join(__dirname, "publicvotes.sample.json"),
], [
    192,
    327,
], path.join(__dirname, "padding"));
