import {darcherConfig, foreignClusterConfig, homeClusterConfig} from "./config/giveth.config";
import {BlockchainCluster, Command} from "@darcher/helpers";
import {ControllerOptions} from "@darcher/config";
import * as child_process from "child_process";
import * as path from "path";

async function deployContracts() {
    // reset clusters
    homeClusterConfig.controller = ControllerOptions.deploy;
    let homeCluster = new BlockchainCluster(homeClusterConfig, darcherConfig.grpcPort);
    homeCluster.reset();
    await homeCluster.start();
    foreignClusterConfig.controller = ControllerOptions.deploy;
    let foreignCluster = new BlockchainCluster(foreignClusterConfig, darcherConfig.grpcPort);
    foreignCluster.reset();
    await foreignCluster.start();

    // wait for 1 second for blockchain clusters to start
    setTimeout(() => {
        // deploy, since shelljs does not support interactive terminal input (stdin),
        // we use native child_process to deploy (since the deploy-local script requires command line input)
        child_process.execFileSync("yarn", ["deploy-local"],
            {stdio: 'inherit', cwd: path.join(__dirname, "..", "feathers-giveth")});
    }, 1000);
}

deployContracts();