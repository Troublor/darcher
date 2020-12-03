import {Config} from "@darcher/config";
import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";
import {mainAccountAddress} from "./config/eth-hot-wallet.config";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    // deploy contracts
    child_process.spawnSync(
        path.join(__dirname, "..", "..", "..", "..", "node_modules", ".bin", "oz"),
        ["deploy", "-k", "regular", "-n", "development", "-f", mainAccountAddress, "WETH9"], {
            cwd: path.join(__dirname, "..", "contracts"),
            stdio: "inherit"
        });

    await cluster.stop();
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "eth-hot-wallet.config.ts")).then(async config => {
        await deploy(config);
    });
}

