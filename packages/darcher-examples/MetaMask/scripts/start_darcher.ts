import {BlockchainCluster, loadConfig, Logger} from "@darcher/helpers";
import * as path from "path";
import {Darcher} from "@darcher/analyzer/src";

loadConfig(path.join(__dirname, "config", "metamask.config.ts")).then(async config => {
    const logger = new Logger("MetaMaskTest");
    logger.level = 'debug';
    const darcher = new Darcher(logger, config);
    try {
        // start darcher
        await darcher.start();

        await Promise.race([
            new Promise(resolve => process.on("SIGINT", resolve)),
            new Promise(resolve => process.on("SIGTERM", resolve)),
            new Promise(resolve => process.on("SIGHUP", resolve)),
        ]);
    } catch (e) {
        console.error(e);
    } finally {
        await darcher.shutdown();
    }
});
