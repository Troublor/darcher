/* Analyze Configurations */
import {analyzeAll} from "./analyze";
import * as path from "path";
import {DBContentDiffFilter} from "@darcher/analyzer";

const reportFile = "giveth.report.json";

// filter out off-chain state on the full snapshot of database
// @ts-ignore
const dbFilter: DBContentDiffFilter = {
    excludes: [
        "conversionrates",
        "conversations",
        "events",
    ],
    "*": {
        excludes: [
            "blockNumber",
            "date",
            "prevStatus",
            ["token", "prevStatus"],
            ["token", "updatedAt"],
            ["token", "createdAt"],
            "createdAt",
            "updatedAt",
        ]
    },
    "users": {
        excludes: [
            "name"
        ]
    }

}

// ignore runtime errors with the following keywords
const runtimeErrorFilter: string[] = [
    "chrome-extension",
    "chromeextensionmm",
    "favicon.ico",
    "sentry.io",
    "infura.io"
]

const dataDir = path.join(__dirname, "..", "experiment-results", "Giveth", "rounds");
const roundDirs = [
    path.join(dataDir, "Giveth0", "transactions"),
    path.join(dataDir, "Giveth1", "transactions"),
    path.join(dataDir, "Giveth2", "transactions"),
    path.join(dataDir, "Giveth3", "transactions"),
    path.join(dataDir, "Giveth4", "transactions"),
    path.join(dataDir, "Giveth5", "transactions"),
    path.join(dataDir, "Giveth6", "transactions"),
    path.join(dataDir, "Giveth7", "transactions"),
    path.join(dataDir, "Giveth8", "transactions"),
    path.join(dataDir, "Giveth9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
