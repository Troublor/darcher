import {Config} from "@darcher/config";
import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    console.log("Please do manual deployment...");
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "multisender.config.ts")).then(async config => {
        await deploy(config);
    });
}
