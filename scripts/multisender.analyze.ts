/* Analyze Configurations */
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "multisender.report.json";

// filter out off-chain state on the full snapshot of database
// @ts-ignore
const dbFilter: DBContentDiffFilter = {
}

// ignore runtime errors with the following keywords
const runtimeErrorFilter: string[] = [
    "chrome-extension",
    "chromeextensionmm",
    "favicon.ico",
    "sentry.io",
    "infura.io"
]
const dataDir = path.join(__dirname, "..", "experiment-results", "Multisender", "rounds");
const roundDirs = [
    path.join(dataDir, "multisender0", "transactions"),
    path.join(dataDir, "multisender1", "transactions"),
    path.join(dataDir, "multisender2", "transactions"),
    path.join(dataDir, "multisender3", "transactions"),
    path.join(dataDir, "multisender4", "transactions"),
    path.join(dataDir, "multisender5", "transactions"),
    path.join(dataDir, "multisender6", "transactions"),
    path.join(dataDir, "multisender7", "transactions"),
    path.join(dataDir, "multisender8", "transactions"),
    path.join(dataDir, "multisender9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
