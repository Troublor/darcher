import {Browser, Command, loadConfig, Logger, MetaMask, sleep} from "@darcher/helpers";
import {DarcherService} from "./start-darcher";
import * as path from "path";
import {startCrawljax} from "@darcher/crawljax/scripts";
import {startDocker} from "./start-docker";
import * as fs from "fs";
import {stopDocker} from "./stop-docker";
import * as child_process from "child_process";


function runAndLog(cmd: Command, cwd: string, logFile: string): child_process.ChildProcess {
    const logStream = fs.createWriteStream(logFile, {encoding: "utf-8"});
    const child = child_process.spawn(
        cmd.command, cmd.args, {
            stdio: ["inherit", "pipe", "pipe"],
            cwd: cwd,
        }
    )
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);
    return child;
}


if (require.main === module) {
    (async () => {
        const logger = new Logger("GivethExperiment", "debug");
        const config = await loadConfig(path.join(__dirname, "config", "giveth.config.ts"));
        const mainClass: string = "GivethExperiment";
        const timeBudget: number = 3600  // in second
        const numRounds: number = 5;
        const metamaskHomeUrl = "chrome-extension://kdaoeelmbdcinklhldlcmmgmndjcmjpp/home.html";
        const metamaskPassword = "12345678";
        const chromeDebugPort = 9222;
        const userDir = "/home/troublor/workspace/darcher_misc/browsers/Chrome/UserData";

        const browser = new Browser(logger, chromeDebugPort, userDir);
        await browser.start();

        async function oneRound(budget: number) {
            const dataDir: string | undefined = path.join(__dirname, "..", "data", `${(() => {
                const now = new Date();
                return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}=${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
            })()}`);
            if (!fs.existsSync(dataDir)) {
                logger.info("Creating data dir", {dataDir: dataDir});
                fs.mkdirSync(dataDir, {recursive: true});
            }

            // start docker
            logger.info("Starting docker...");
            await startDocker(logger, config.clusters[0].controller);
            await sleep(1000); // wait for docker to start

            // start dapp
            const p1 = runAndLog(
                new Command("yarn", "start:networks"),
                path.join(__dirname, "..", "feathers-giveth"),
                path.join(dataDir, "networks.log")
            );
            const p2 = runAndLog(
                new Command("yarn", "start"),
                path.join(__dirname, "..", "feathers-giveth"),
                path.join(dataDir, "feathers.log")
            );
            const p3 = runAndLog(
                new Command("yarn", "start"),
                path.join(__dirname, "..", "giveth-dapp"),
                path.join(dataDir, "dapp.log")
            );

            logger.info("Waiting for dapp to start...");
            await sleep(15000);

            // clear MetaMask data
            logger.info("Clearing MetaMask data...");
            await new MetaMask(logger, browser.driver, metamaskHomeUrl, metamaskPassword)
                .changeNetwork("Localhost 8545")
                .changeAccount("Giveth0")
                .resetAccount()
                .changeAccount("Giveth1")
                .resetAccount()
                .changeNetwork("Localhost 8546")
                .resetAccount()
                .changeAccount("Giveth0")
                .resetAccount()
                .do();


            // start darcher
            logger.info("Starting DArcher...");
            const darcherService = new DarcherService(logger, config, path.join(dataDir, "transactions"));
            await darcherService.start();

            // start crawljax
            logger.info("Starting crawljax...");
            await startCrawljax(logger, `localhost:${chromeDebugPort}`, mainClass, budget, dataDir);

            // stop dapp
            p1.kill("SIGINT");
            p2.kill("SIGINT");
            p3.kill("SIGINT");

            // stop docker
            logger.info("Stopping docker...");
            await stopDocker();

            // stop darcher
            logger.info("Stopping DArcher...");
            await darcherService.shutdown();

            await sleep(5000);
        }

        for (let i = 0; i < numRounds; i++) {
            logger.info("Starting experiment round", {round: i});
            await oneRound(timeBudget);
            logger.info("Experiment round finishes", {round: i});
        }

        await browser.shutdown();
    })().catch(e => console.error(e));
}
