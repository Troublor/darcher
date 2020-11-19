import {BlockchainCluster, loadConfig, Logger} from "@darcher/helpers";
import * as path from "path";
import {Darcher} from "@darcher/analyzer/src";
import DBMonitor from "@darcher/dbmonitor";

loadConfig(path.join(__dirname, "config", "giveth.config.ts")).then(async config => {
    const logger = new Logger("GivethExperiment");
    logger.level = 'debug';
    const darcher = new Darcher(logger, config);
    const dbmonitor = new DBMonitor(logger, config);
    try {
        // start darcher
        await darcher.start();
        await dbmonitor.start();

        await Promise.race([
            new Promise(resolve => process.on("SIGINT", resolve)),
            new Promise(resolve => process.on("SIGTERM", resolve)),
            new Promise(resolve => process.on("SIGHUP", resolve)),
        ]);
    } catch (e) {
        console.error(e);
    } finally {
        await dbmonitor.shutdown();
        await darcher.shutdown();
    }
});
