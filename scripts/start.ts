// this script takes a command line argument indicating the config.ts file
// and start darcher according to this config file
// config file should be a .ts file and export default a Config object in package @darcher/config
import {Config} from "@darcher/config";
import {startCluster, startDarcher, startDBMonitor} from "./startUtils";

if (process.argv.length < 3) {
    console.error("not input config file");
    process.exit(-1);
}
let configFile = process.argv[2];

import(configFile).then((m) => {
    let config = m.default as Config;
    // start darcher
    startDarcher(config.darcher, config.dbMonitor, configFile);

    // start blockchain clusters
    for (let cluster of config.clusters) {
        startCluster(config.darcher, cluster);
    }

    // start dbmonitor
    startDBMonitor(config.darcher, config.dbMonitor);
});

