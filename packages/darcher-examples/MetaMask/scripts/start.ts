import {BlockchainCluster, loadConfig} from "@darcher/helpers";
import * as path from "path";

loadConfig(path.join(__dirname, "config", "metamask.config.ts")).then(async config => {
    let cluster = new BlockchainCluster(config.clusters[0]);
    try {
        let background = false;
        await cluster.start(background);
        console.info("[Success] Blockchain started");
        if (background) {
            await Promise.race([
                new Promise(resolve => process.on("SIGINT", resolve)),
                new Promise(resolve => process.on("SIGTERM", resolve)),
                new Promise(resolve => process.on("SIGHUP", resolve)),
            ]);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await cluster.stop();
    }
});
