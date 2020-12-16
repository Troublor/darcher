import {Browser, loadConfig, Logger, MetaMask, sleep} from "@darcher/helpers";
import {DarcherService} from "./start-darcher";
import * as path from "path";
import {startCrawljax} from "@darcher/crawljax/scripts";
import {startDocker} from "./start-docker";
import * as child_process from "child_process";
import * as fs from "fs";
import {stopDocker} from "./stop-docker";
import {ProposalService, reset, start} from "./dapp";


if (require.main === module) {
    (async () => {
        const logger = new Logger("SovereignExperiment", "debug");
        const config = await loadConfig(path.join(__dirname, "config", "sovereign.config.ts"));
        const mainClass: string = "SovereignExperiment";
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
            reset();
            const dapp = await start(fs.createWriteStream(path.join(dataDir, "dapp.log")));

            // start darcher
            logger.info("Starting DArcher...");
            const darcherService = new DarcherService(logger, config, path.join(dataDir, "transactions"));
            await darcherService.start();
            await sleep(3000);

            // clear MetaMask data
            logger.info("Clearing MetaMask data...");
            await new MetaMask(logger, browser.driver, metamaskHomeUrl, metamaskPassword)
                .changeNetwork("Localhost 8545")
                .changeAccount("Default0")
                .resetAccount()
                .do();

            const proposalService = new ProposalService(darcherService.darcher, logger);
            await proposalService.start();

            // start crawljax
            logger.info("Starting crawljax...");
            await startCrawljax(logger, `localhost:${chromeDebugPort}`, mainClass, budget, dataDir);

            dapp.kill("SIGINT");
            await proposalService.shutdown();

            // stop docker
            logger.info("Stopping docker...");
            await stopDocker();

            // stop darcher
            logger.info("Stopping DArcher...");
            await darcherService.shutdown();
        }

        for (let i = 0; i < numRounds; i++) {
            logger.info("Starting experiment round", {round: i});
            await oneRound(timeBudget);
            logger.info("Experiment round finishes", {round: i});
        }

        await browser.shutdown();
    })().catch(e => console.error(e));
}
