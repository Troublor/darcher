import {Config} from "@darcher/config";
import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    child_process.spawnSync(
        path.join(__dirname, "..", "..", "node_modules", ".bin", "truffle"),
        ["migrate", "--reset"],{
            stdio: "inherit",
            cwd: path.join(__dirname, "..", "note_dapp")
        }
    );

    await cluster.stop();
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "note_dapp.config.ts")).then(async config => {
        await deploy(config);
    });
}

