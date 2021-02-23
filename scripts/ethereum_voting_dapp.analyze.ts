import {DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "ethereum_voting_dapp.report.json";

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

const dataDir = path.join(__dirname, "..", "experiment-results", "Ethereum-Voting-Dapp", "rounds");
const roundDirs = [
    path.join(dataDir, "ethereum_voting_dapp0", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp1", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp2", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp3", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp4", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp5", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp6", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp7", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp8", "transactions"),
    path.join(dataDir, "ethereum_voting_dapp9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
