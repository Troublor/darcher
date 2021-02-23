import {DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "heiswap.report.json";

// filter out off-chain state on the full snapshot of database
const dbFilter: DBContentDiffFilter = {};

// ignore runtime errors with the following keywords
const runtimeErrorFilter :string[] = [
    "chrome-extension",
    "chromeextensionmm",
    "favicon.ico",
    "sentry.io",
    "infura.io"
];

const dataDir = path.join(__dirname, "..", "experiment-results", "Heiswap", "rounds");
const roundDirs = [
    path.join(dataDir, "heiswap0", "transactions"),
    path.join(dataDir, "heiswap1", "transactions"),
    path.join(dataDir, "heiswap2", "transactions"),
    path.join(dataDir, "heiswap3", "transactions"),
    path.join(dataDir, "heiswap4", "transactions"),
    path.join(dataDir, "heiswap5", "transactions"),
    path.join(dataDir, "heiswap6", "transactions"),
    path.join(dataDir, "heiswap7", "transactions"),
    path.join(dataDir, "heiswap8", "transactions"),
    path.join(dataDir, "heiswap9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
