/* Analyze Configurations */
import {DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "augur.report.json";

// filter out off-chain state on the full snapshot of database
// @ts-ignore
const dbFilter: DBContentDiffFilter = {
    "*": {
        excludes: [
            "blockNumber",
            "blockHash",
        ]
    },
    excludes: [
        "TokensTransferred",
        "Rollback",
        "SyncStatus",
        "TimestampSet",
        "TokenBalanceChangedRollup",
        "WarpSync",
        "WarpSyncCheckpoints",
    ],
}

// ignore runtime errors with the following keywords
const runtimeErrorFilter: string[] = [
    "chrome-extension",
    "chromeextensionmm",
    "favicon.ico",
    "sentry.io",
    "infura.io"
]

const dataDir = path.join(__dirname, "..", "experiment-results", "Augur", "rounds");
const roundDirs = [
    path.join(dataDir, "Augur0", "transactions"),
    path.join(dataDir, "Augur1", "transactions"),
    path.join(dataDir, "Augur2", "transactions"),
    path.join(dataDir, "Augur3", "transactions"),
    path.join(dataDir, "Augur4", "transactions"),
    path.join(dataDir, "Augur5", "transactions"),
    path.join(dataDir, "Augur6", "transactions"),
    path.join(dataDir, "Augur7", "transactions"),
    path.join(dataDir, "Augur8", "transactions"),
    path.join(dataDir, "Augur9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
