import {Config} from "@darcher/config";
import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";
import {mainAccountAddress} from "./config/metamask.config";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    // deploy contracts
    child_process.spawnSync(
        path.join(__dirname, "..", "..", "node_modules", ".bin", "truffle"),
        ["migrate", "--reset", "--network", "development"], {
            cwd: path.join(__dirname, "..", "contracts"),
            stdio: "inherit"
        });

    await cluster.stop();
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "metamask.config.ts")).then(async config => {
        await deploy(config);
    });
}

