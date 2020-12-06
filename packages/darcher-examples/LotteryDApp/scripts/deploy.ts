import {Config} from "@darcher/config";
import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    child_process.spawnSync(
        "truffle",
        ["migrate", "--reset"],{
            stdio: "inherit",
            cwd: path.join(__dirname, "..", "Lottery-DApp")
        }
    )
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "lottery-dapp.config.ts")).then(async config => {
        await deploy(config);
    });
}

