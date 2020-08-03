import * as shell from "shelljs";
import {Command, Logger, sleep, Tab, TerminalWindow} from "@darcher/helpers";
import * as path from "path";

const logger: Logger = new Logger("start_augur");

async function start_blockchain() {
    logger.info("Start blockchain cluster in docker");
    let cmd = new Command("docker-compose", "-f", path.join(__dirname, "docker", "docker-compose.yml"), "up", "-d");
    shell.exec(cmd.toString());
    logger.info("Wait 3 seconds for blockchain to start...");
    await sleep(3000);
}

async function start_augur() {
    let cmd1 = new Command("yarn", "flash", "docker-all", "--do-not-run-geth", "run:gsn");
    let cmd2 = new Command("tsc", "build", "-w");
    let cmd3 = new Command("yarn", "ui", "dev");
    let window = new TerminalWindow(
        new Tab(cmd1, true, path.join(__dirname, "..", "augur")),
        new Tab(cmd2, false, path.join(__dirname, "..", "augur")),
        new Tab(cmd3, false, path.join(__dirname, "..", "augur")));
    window.open();
}

start_blockchain().then(async () => {
    await start_augur();
});

