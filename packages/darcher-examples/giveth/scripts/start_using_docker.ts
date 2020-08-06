import * as shell from "shelljs";
import {Command, Logger, TerminalWindow} from "@darcher/helpers";
import * as path from "path";
import {startFeathersGiveth, startGivethDApp} from "./start";

const logger: Logger = new Logger("start_augur");

async function start_blockchain() {
    logger.info("Start blockchain cluster in docker");
    let cmd = new Command("docker-compose", "-f", path.join(__dirname, "docker", "docker-compose.yml"), "up", "-d");
    shell.exec(cmd.toString());
}

if (require.main === module) {
    start_blockchain().then(async () => {
        setTimeout(() => {
            let window = new TerminalWindow();
            startFeathersGiveth(window)
            startGivethDApp(window);
            window.open();
        }, 3000);
    });
}
