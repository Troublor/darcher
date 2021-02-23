import {DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "metamask.report.json";

// filter out off-chain state on the full snapshot of database
const dbFilter: DBContentDiffFilter = {
    "storage": {
        excludes: [
            ["data", "CurrencyController"]
        ]
    }
};

// ignore runtime errors with the following keywords
const runtimeErrorFilter :string[] = [
    "chrome-extension",
    "chromeextensionmm",
    "favicon.ico",
    "sentry.io",
    "infura.io"
];

const dataDir = path.join(__dirname, "..", "experiment-results", "MetaMask", "rounds");
const roundDirs = [
    path.join(dataDir, "metamask0", "transactions"),
    path.join(dataDir, "metamask1", "transactions"),
    path.join(dataDir, "metamask2", "transactions"),
    path.join(dataDir, "metamask3", "transactions"),
    path.join(dataDir, "metamask4", "transactions"),
    path.join(dataDir, "metamask5", "transactions"),
    path.join(dataDir, "metamask6", "transactions"),
    path.join(dataDir, "metamask7", "transactions"),
    path.join(dataDir, "metamask8", "transactions"),
    path.join(dataDir, "metamask9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
