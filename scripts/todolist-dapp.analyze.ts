import {DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "todolist-dapp.report.json";

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

const dataDir = path.join(__dirname, "..", "experiment-results", "TodoList-Dapp", "rounds");
const roundDirs = [
    path.join(dataDir, "ethereum-todolist0", "transactions"),
    path.join(dataDir, "ethereum-todolist1", "transactions"),
    path.join(dataDir, "ethereum-todolist2", "transactions"),
    path.join(dataDir, "ethereum-todolist3", "transactions"),
    path.join(dataDir, "ethereum-todolist4", "transactions"),
    path.join(dataDir, "ethereum-todolist5", "transactions"),
    path.join(dataDir, "ethereum-todolist6", "transactions"),
    path.join(dataDir, "ethereum-todolist7", "transactions"),
    path.join(dataDir, "ethereum-todolist8", "transactions"),
    path.join(dataDir, "ethereum-todolist9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
