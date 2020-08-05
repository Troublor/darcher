import {BlockchainCluster, Command, loadConfig, Logger, sleep, Tab, TerminalWindow} from "@darcher/helpers";
import * as path from "path";
import {Config} from "@darcher/config";

const logger: Logger = new Logger("start_augur");

async function start_blockchain(config: Config) {
    logger.info("Start blockchain cluster");
    let cluster = new BlockchainCluster(config.clusters[0]);
    await cluster.start();
}

async function start_augur() {
    let cmd1 = new Command("yarn", "flash", "docker-all", "--do-not-run-geth", "run:gsn");
    let cmd3 = new Command("yarn", "ui", "dev");
    let window = new TerminalWindow(
        new Tab(cmd1, true, path.join(__dirname, "..", "augur")),
        new Tab(cmd3, false, path.join(__dirname, "..", "augur")));
    window.open();
}

loadConfig(path.join(__dirname, "config", "augur.config.ts")).then(async config => {
    await start_blockchain(config);
    await sleep(3000);
    await start_augur();
})