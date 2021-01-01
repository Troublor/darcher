import {Config} from "@darcher/config";
import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    // deploy contracts
    const result = child_process.spawnSync(
        path.join(__dirname, "..", "ethereum-todolist", "node_modules", ".bin", "truffle"),
        ["migrate", "--reset"], {
            cwd: path.join(__dirname, "..", "ethereum-todolist"),
            stdio: "inherit",
            env: process.env,
        });

    if (result.error) {
        console.error(result.error);
    }

    await cluster.stop();
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "ethereum-todolist.config.ts")).then(async config => {
        await deploy(config);
    });
}

