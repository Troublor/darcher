import * as shell from "shelljs";
import {Command, Logger, sleep, Tab, TerminalWindow} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import * as fs from "fs";
import {Config} from "@darcher/config";

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

    logger.info("Start blockchain cluster in docker");
    child_process.spawn(
        "docker-compose",
        ["-f", path.join(__dirname, "docker", "cluster-docker-compose.yml"), "up", "-d"], {
            stdio: 'inherit',
            env: Object.assign(process.env, {
                ETHMONITOR_CONTROLLER: ethmonitorController,
            })
        });
}

if (require.main === module) {
    startDocker(logger, "darcher").then(async () => {

    });
}

