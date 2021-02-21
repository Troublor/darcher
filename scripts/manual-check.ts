import {SampledFunctionality} from "./sample";
import * as fs from "fs";
import {analyzeTransactionLog, DBChangeOracle, DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";

export function manualCheck(sampleFile: string, dbFilter: DBContentDiffFilter) {
    const samples: SampledFunctionality[] = JSON.parse(fs.readFileSync(sampleFile, {encoding: "utf-8"}));
    console.log("Bug-I");
    let count = 0;
    for (const sample of samples.filter(value => value.bugType === "Bug-I")) {
        console.log(sample.stack);
        for (const tx of sample.sampledTransactions) {
            const dir = tx.split(":")[0];
            const hash = tx.split(":")[1];
            const log = JSON.parse(fs.readFileSync(path.join(dir, `${hash}.json`), {encoding: "utf-8"}));
            const reports = analyzeTransactionLog(new DBChangeOracle(hash, dbFilter), log);
            reports.forEach(value => console.log(value.message()));
            count++;
        }
    }
    console.log("total transactions", count);

    console.log("Bug-II");
    count = 0;
    for (const sample of samples.filter(value => value.bugType === "Bug-II")) {
        console.log(sample.stack);
        for (let i = 0; i < sample.sampledTransactions.length; i++) {
            const tx = sample.sampledTransactions[i];
            const dir = tx.split(":")[0];
            const hash = tx.split(":")[1];
            const log = JSON.parse(fs.readFileSync(path.join(dir, `${hash}.json`), {encoding: "utf-8"}));
            const reports = analyzeTransactionLog(new DBChangeOracle(hash, dbFilter), log);
            reports.forEach(value => console.log(value.message()));
            count++;
        }
    }
    console.log("total transactions", count);
}
