import {Config} from "@darcher/config";
import {BlockchainCluster, Command, loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";

async function deployAugurContracts(config: Config) {
    let cluster = new BlockchainCluster(config.clusters[0]);

    async function kill() {
        console.log("stopping");
        await cluster.stop();
    }
    process.on("SIGINT", kill);
    process.on("SIGHUP",kill);
    process.on("SIGTERM", kill);
    cluster.reset();
    await cluster.deploy(true);


    try {
        console.log("Start deploy augur contracts");
        let cmd = new Command("yarn")
            .append("flash")
            .append("fake-all")
            .append("--parallel")
            .append("--createMarkets");
        child_process.execSync(cmd.toString(), {
            cwd: path.join(__dirname, "..", "augur"),
            stdio: 'inherit',
        });
    } catch (e) {
        console.error(e);
    }finally {
        await cluster.stop();
    }
}

loadConfig(path.join(__dirname, "config", "augur.config.ts")).then(async config => {
    await deployAugurContracts(config);
});