import {BlockchainCluster, loadConfig} from "@darcher/helpers";
import {Config} from "@darcher/config";
import * as child_process from "child_process";
import * as path from "path";

async function deployContracts(config: Config) {
    // reset clusters
    let cluster1 = new BlockchainCluster(config.clusters[0]);
    cluster1.reset();
    await cluster1.deploy(true);
    let cluster2 = new BlockchainCluster(config.clusters[1]);
    cluster2.reset();
    await cluster2.deploy(true);

    try {
        child_process.spawnSync("yarn", ["deploy-local"],
            {stdio: 'inherit', cwd: path.join(__dirname, "..", "feathers-giveth")});
    } catch (e) {
        console.error(e);
    } finally {
        await cluster1.stop();
        await cluster2.stop();
    }
}

loadConfig(path.join(__dirname, "config", "giveth.config.ts")).then(async config => {
    await deployContracts(config);
})
