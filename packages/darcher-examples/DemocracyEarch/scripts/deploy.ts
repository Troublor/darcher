import {Config} from "@darcher/config";
import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    // deploy WETH
    let result = child_process.spawnSync(
        path.join(__dirname, "..", "..", "node_modules", ".bin", "truffle"),
        ["migrate", "--reset", "--network", "development"],{
            cwd: path.join(__dirname, "..", "tokens", "WETH"),
            stdio: "inherit",
        }
    );
    if (result.error) {
        console.log(result.error)
    }

    result = child_process.spawnSync(
        "npx",
        ["buidler", "--network", "testnet", "moloch-deploy"], {
            cwd: path.join(__dirname, "..", "DemocracyDAO"),
            stdio: "inherit",
        }
    );
    if (result.error) {
        console.log(result.error)
    }

    await cluster.stop();
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "sovereign.config.ts")).then(async config => {
        await deploy(config);
    });
}

