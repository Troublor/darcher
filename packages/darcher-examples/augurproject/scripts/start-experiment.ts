import {Browser, loadConfig, Logger, MetaMask, sleep} from "@darcher/helpers";
import clearIndexedDB from "./clear-indexedDB";
import {DarcherService} from "./start_darcher";
import * as path from "path";
import {startCrawljax} from "@darcher/crawljax/scripts";
import {startDocker} from "./start_using_docker";
import * as child_process from "child_process";
import * as fs from "fs";
import {stopDocker} from "./stop_docker";


if (require.main === module) {
    (async () => {
        const logger = new Logger("AugurExperiment", "debug");
        const config = await loadConfig(path.join(__dirname, "config", "augur.config.ts"));
        const dataDir: string | undefined = path.join(__dirname, "..", "data", `${(() => {
            const now = new Date();
            return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}=${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
        })()}`);
        const mainClass: string = "AugurExperiment";
        const timeBudget: number = 3600  // in second
        const numRounds: number = 5;
        const metamaskHomeUrl = "chrome-extension://jbppcachblnkaogkgacckpgohjbpcekf/home.html";
        const metamaskPassword = "12345678";
        const chromeDebugPort = 9222;
        const userDir = "/Users/troublor/workspace/darcher_mics/browsers/Chrome/UserData";

        const cleanupTasks: (() => Promise<void>)[] = [];

        process.on("SIGINT", async () => {
            for (const task of cleanupTasks) {
                await task();
            }
        });

        const browser = new Browser(logger, chromeDebugPort, userDir);
        await browser.start();
        cleanupTasks.unshift(async ()=>{
            logger.info("Closing browser...");
            await browser.shutdown();
        })

        if (!fs.existsSync(dataDir)) {
            logger.info("Creating data dir", {dataDir: dataDir});
            fs.mkdirSync(dataDir, {recursive: true});
        }

        let gsnStarted = false;
        let relayer: child_process.ChildProcess | undefined = undefined;


        async function oneRound(budget: number) {
            // start docker
            logger.info("Starting docker...");
            await startDocker(logger, config.clusters[0].controller);
            await sleep(1000); // wait for docker to start

            cleanupTasks.unshift(async () => {
                logger.info("Stopping docker...");
                await stopDocker();
            });

            // clear MetaMask data
            logger.info("Clearing MetaMask data...");
            await new MetaMask(logger, browser.driver, metamaskHomeUrl, metamaskPassword)
                .changeNetwork("Localhost 8545")
                .changeAccount("Augur0")
                .resetAccount()
                .do();

            // clear indexedDB
            logger.info("Clearing IndexedDB...");
            await clearIndexedDB(logger, browser.driver, [config.dbMonitor.dbName, "0x-mesh/mesh_dexie_db",]);

            // start darcher
            logger.info("Starting DArcher...");
            const darcherService = new DarcherService(logger, config, path.join(dataDir, "transactions"));
            await darcherService.start();

            if (!gsnStarted) {
                logger.info("Starting GSN Relayer...");
                const relayerStdout = fs.createWriteStream(path.join(dataDir, "relayer.stdout.log"), {encoding: "utf-8"});
                const relayerStderr = fs.createWriteStream(path.join(dataDir, "relayer.stderr.log"), {encoding: "utf-8"});
                relayer = child_process.spawn("yarn", ["gsn:relay"], {
                    cwd: path.join(__dirname, "..", ".."),
                    stdio: ["inherit", "pipe", "pipe"],
                });
                relayer.stdout.pipe(relayerStdout);
                relayer.stderr.pipe(relayerStderr);
                relayer.on("exit", () => {
                    logger.info("GSN Relayer stopped");
                    gsnStarted = false;
                    relayer = undefined;
                });
                gsnStarted = true;
                cleanupTasks.unshift(() => {
                    // kill GSN relayer
                    if (relayer) {
                        logger.info("Stopping GSN Relayer...");
                        relayer.kill("SIGINT");
                    }
                    return Promise.resolve();
                })
            }

            // start crawljax
            logger.info("Starting crawljax...");
            await startCrawljax(logger, `localhost:${chromeDebugPort}`, mainClass, budget, dataDir);

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

        for (const task of cleanupTasks) {
            await task();
        }
    })().catch(e => console.error(e));
}
