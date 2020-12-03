import {Config} from "@darcher/config";
import {loadConfig, sleep} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";
import {mainAccountAddress} from "./config/etheroll.config";
import Web3 from "web3";
import BN from "bn.js";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    // deploy oraclize contracts
    const oraclize = child_process.spawn(
        "ethereum-bridge",
        ["-H", "localhost:8545", "-a", "1"], {
            env: Object.assign(process.env, {
                PATH: process.env.PATH + ":" + path.join(__dirname, "..", "..", "..", "..", "node_modules", ".bin"),
            }),
            stdio: "inherit"
        }
    );

    await sleep(60000); // wait for 30 sec for oraclize to deploy

    // deploy contracts
    child_process.spawnSync(
        "oz",
        ["deploy", "-k", "regular", "-n", "development", "-f", mainAccountAddress, "Etheroll"], {
            cwd: path.join(__dirname, "..", "contracts"),
            stdio: "inherit"
        });

    const contractAddress = "0x0DA18EBf3C1bA9c201B97693af91757040840664";
    // add fund to contract
    const web3 = new Web3("http://localhost:8545");
    await web3.eth.sendTransaction({
        from: mainAccountAddress,
        to:contractAddress,
        value: web3.utils.toWei(new BN(15), 'ether')
    });

    oraclize.kill("SIGINT");
    await cluster.stop();
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "etheroll.config.ts")).then(async config => {
        await deploy(config);
    });
}

