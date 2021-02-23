import {DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "publicvotes.report.json";

// filter out off-chain state on the full snapshot of database
// @ts-ignore
const dbFilter: DBContentDiffFilter = {
    "*": {
        excludes: [
            "contract_abi",
            "block"
        ],
    },
    excludes: [
        "system.indexes"
    ]
};

// ignore runtime errors with the following keywords
const runtimeErrorFilter: string[] = [
    "chrome-extension",
    "chromeextensionmm",
    "favicon.ico",
    "sentry.io",
    "infura.io"
];

const dataDir = path.join(__dirname, "..", "experiment-results", "PublicVotes", "rounds");
const roundDirs = [
    path.join(dataDir, "publicvotes0", "transactions"),
    path.join(dataDir, "publicvotes1", "transactions"),
    path.join(dataDir, "publicvotes2", "transactions"),
    path.join(dataDir, "publicvotes3", "transactions"),
    path.join(dataDir, "publicvotes4", "transactions"),
    path.join(dataDir, "publicvotes5", "transactions"),
    path.join(dataDir, "publicvotes6", "transactions"),
    path.join(dataDir, "publicvotes7", "transactions"),
    path.join(dataDir, "publicvotes8", "transactions"),
    path.join(dataDir, "publicvotes9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
