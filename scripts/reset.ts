// this script takes a command line argument indicating the config.ts file
// and start darcher according to this config file
// config file should be a .ts file and export default a Config object in package @darcher/config
import {Config, ControllerOptions} from "@darcher/config";
import {resetCluster, startCluster, startDarcher, startDBMonitor} from "./startUtils";
import * as path from "path";

if (process.argv.length < 3) {
    console.error("not input config file");
    process.exit(-1);
}
let configName = process.argv[2];
if (!configName.endsWith(".config.ts")) {
    configName += ".config.ts";
}


import(path.join(__dirname, "configs", `${configName}`)).then((m) => {
    let config = m.default as Config;
    // reset blockchain clusters
    for (let cluster of config.clusters) {
        resetCluster(cluster);
    }
});

