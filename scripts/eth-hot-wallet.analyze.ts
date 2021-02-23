import {DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "eth-hot-wallet.report.json";

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

const dataDir = path.join(__dirname, "..", "experiment-results", "ETH-Hot-Wallet", "rounds");
const roundDirs = [
    path.join(dataDir, "eth-hot-wallet0", "transactions"),
    path.join(dataDir, "eth-hot-wallet1", "transactions"),
    path.join(dataDir, "eth-hot-wallet2", "transactions"),
    path.join(dataDir, "eth-hot-wallet3", "transactions"),
    path.join(dataDir, "eth-hot-wallet4", "transactions"),
    path.join(dataDir, "eth-hot-wallet5", "transactions"),
    path.join(dataDir, "eth-hot-wallet6", "transactions"),
    path.join(dataDir, "eth-hot-wallet7", "transactions"),
    path.join(dataDir, "eth-hot-wallet8", "transactions"),
    path.join(dataDir, "eth-hot-wallet9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
