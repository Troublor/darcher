import {DBContentDiffFilter} from "@darcher/analyzer";
import * as path from "path";
import {analyzeAll} from "./analyze";

const reportFile = "democracy-earth.report.json";

// filter out off-chain state on the full snapshot of database
const dbFilter: DBContentDiffFilter = {
    "*":{
        excludes: [
            ["timestamp"],
            ["randomSortOrder"],
        ]
    },
    "collectives": {
        excludes: [
            ["profile"],
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

const dataDir = path.join(__dirname, "..", "experiment-results", "DemocracyEarth", "rounds");
const roundDirs = [
    path.join(dataDir, "DemocracyEarth0", "transactions"),
    path.join(dataDir, "DemocracyEarth1", "transactions"),
    path.join(dataDir, "DemocracyEarth2", "transactions"),
    path.join(dataDir, "DemocracyEarth3", "transactions"),
    path.join(dataDir, "DemocracyEarth4", "transactions"),
    path.join(dataDir, "DemocracyEarth5", "transactions"),
    path.join(dataDir, "DemocracyEarth6", "transactions"),
    path.join(dataDir, "DemocracyEarth7", "transactions"),
    path.join(dataDir, "DemocracyEarth8", "transactions"),
    path.join(dataDir, "DemocracyEarth9", "transactions"),
];

analyzeAll(roundDirs, dbFilter, runtimeErrorFilter, reportFile);
