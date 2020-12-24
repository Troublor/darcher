import {BlockchainCluster, Command, loadConfig, Logger, sleep, Tab, TerminalWindow} from "@darcher/helpers";
import * as path from "path";
import {Config} from "@darcher/config";
import * as fs from "fs";
import * as child_process from "child_process";
import {formatAddress} from "./start_using_docker";

const logger: Logger = new Logger("start_augur");

async function start_blockchain(config: Config) {
    logger.info("Start blockchain cluster");
    let cluster = new BlockchainCluster(config.clusters[0]);
    await cluster.start();
}

async function start_augur() {
    // load augur local network config
    const configFile = path.join(__dirname, "..", "augur", "packages", "augur-artifacts", "build", "environments", "local.json");
    const config: any = JSON.parse(fs.readFileSync(configFile, {encoding: "utf-8"}));
    child_process.spawn(
        "docker-compose",
        ["-f", path.join(__dirname, "docker", "0x-docker-compose.yml"), "up", "-d"], {
            env: {
                ...process.env,
                MESH_VERSION:"9.3.0",
                ETHEREUM_CHAIN_ID: config.networkId,
                CUSTOM_CONTRACT_ADDRESSES: JSON.stringify(config.addresses),
                ZEROX_CONTRACT_ADDRESS: formatAddress(config.addresses.ZeroXTrade, {lower: true, prefix: false}),
            },
        }
    )
    let cmd3 = new Command("yarn", "ui", "dev");
    let window = new TerminalWindow(
        new Tab(cmd3, false, path.join(__dirname, "..", "augur")));
    window.open();
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "augur.config.ts")).then(async config => {
        // await start_blockchain(config);
        // await sleep(3000);
        await start_augur();
    });
}


