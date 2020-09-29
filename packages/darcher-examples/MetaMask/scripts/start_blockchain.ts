import {BlockchainCluster, loadConfig, Logger} from "@darcher/helpers";
import * as path from "path";
import {Darcher} from "@darcher/analyzer/src";

loadConfig(path.join(__dirname, "config", "metamask.config.ts")).then(async config => {
    const cluster = new BlockchainCluster(config.clusters[0]);
    try {
        // start blockchain
        let background = false;
        await cluster.start(background);
        console.info("[Success] Blockchain started");
        await Promise.race([
            new Promise(resolve => process.on("SIGINT", resolve)),
            new Promise(resolve => process.on("SIGTERM", resolve)),
            new Promise(resolve => process.on("SIGHUP", resolve)),
        ]);
    } catch (e) {
        console.error(e);
    } finally {
        await cluster.stop();
    }
});
