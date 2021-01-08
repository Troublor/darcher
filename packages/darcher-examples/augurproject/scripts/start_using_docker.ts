import * as shell from "shelljs";
import {Command, Logger, sleep, Tab, TerminalWindow} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import * as fs from "fs";
import {Config} from "@darcher/config";
import * as os from "os";

const logger: Logger = new Logger("start_augur");

export interface AddressFormatting {
    lower?: boolean;
    prefix?: boolean;
}

export function formatAddress(address: string, formatting: AddressFormatting): string {
    if (formatting.lower === true) {
        address = address.toLowerCase();
    }

    const hasPrefix = address.slice(0, 2) === '0x';
    if (formatting.prefix === true && !hasPrefix) {
        address = `0x${address}`;
    } else if (formatting.prefix === false && hasPrefix) {
        address = address.slice(2);
    }

    return address
}

export async function startDocker(logger: Logger, ethmonitorController: string = "deploy") {
    // load augur local network config
    const configFile = path.join(__dirname, "..", "augur", "packages", "augur-artifacts", "build", "environments", "local.json");
    const config: any = JSON.parse(fs.readFileSync(configFile, {encoding: "utf-8"}));

    const osType = os.type();
    const analyzerAddr = osType === "Linux" ? "172.17.0.1:1234" : "host.docker.internal:1234";
    const ethAddr = osType === "Linux" ? "http://172.17.0.1:8545" : "http://host.docker.internal:8545";

    logger.info("Start blockchain cluster in docker");
    child_process.spawn(
        "docker-compose",
        ["-f", path.join(__dirname, "docker", "cluster-docker-compose.yml"), "up", "-d"], {
            // stdio: 'inherit',
            env: Object.assign(process.env, {
                ETHMONITOR_CONTROLLER: ethmonitorController,
                ANALYZER_ADDR: analyzerAddr,
            }),
            stdio: "inherit",
        });
    child_process.spawn(
        "docker-compose",
        ["-f", path.join(__dirname, "docker", "0x-docker-compose.yml"), "up", "-d"], {
            env: {
                ...process.env,
                MESH_VERSION: "9.3.0",
                ETHEREUM_RPC_URL: ethAddr,
                ETHEREUM_CHAIN_ID: config.networkId,
                CUSTOM_CONTRACT_ADDRESSES: JSON.stringify(config.addresses),
                ZEROX_CONTRACT_ADDRESS: formatAddress(config.addresses.ZeroXTrade, {lower: true, prefix: false}),
            },
            stdio: "inherit",
        }
    )
}

async function start_augur() {
    let cmd1 = new Command("yarn", "flash", "docker-all", "--do-not-run-geth", "run:gsn");
    let cmd3 = new Command("yarn", "ui", "dev");
    let window = new TerminalWindow(
        new Tab(cmd1, true, path.join(__dirname, "..", "augur")),
        new Tab(cmd3, false, path.join(__dirname, "..", "augur")));
    window.open();
}

if (require.main === module) {
    startDocker(logger, "console").then(async () => {

    });
}

