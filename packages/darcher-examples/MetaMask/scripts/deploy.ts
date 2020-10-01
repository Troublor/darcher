import {BlockchainCluster, loadConfig, Logger, sleep} from "@darcher/helpers";
import * as path from "path";

loadConfig(path.join(__dirname, "config", "metamask.config.ts")).then(async config => {
    let cluster = new BlockchainCluster(config.clusters[0]);
    cluster.reset();
    try {
        await cluster.deploy(true);
        await sleep(2000);
        console.info("[Success] Blockchain configured");
    } catch (e) {
        console.log(e);
    } finally {
        await cluster.stop();
    }
});
