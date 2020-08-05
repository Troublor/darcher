import {darcherConfig, foreignClusterConfig, homeClusterConfig} from "./config/giveth.config";
import {BlockchainCluster, Command} from "@darcher/helpers";
import {ControllerOptions} from "@darcher/config";
import * as child_process from "child_process";
import * as path from "path";

async function deployContracts() {
    // reset clusters
    homeClusterConfig.controller = ControllerOptions.deploy;
    let homeCluster = new BlockchainCluster(homeClusterConfig);
    homeCluster.reset();
    await homeCluster.deploy(true);
    foreignClusterConfig.controller = ControllerOptions.deploy;
    let foreignCluster = new BlockchainCluster(foreignClusterConfig);
    foreignCluster.reset();
    await foreignCluster.deploy(true);

    try {
        child_process.spawnSync("yarn", ["deploy-local"],
            {stdio: 'inherit', cwd: path.join(__dirname, "..", "feathers-giveth")});
    } catch (e) {
        console.error(e);
    } finally {
        await homeCluster.stop();
        await foreignCluster.stop();
    }
}

deployContracts();