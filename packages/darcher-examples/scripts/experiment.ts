import {Browser, loadConfig, Logger, MetaMask, sleep} from "@darcher/helpers";
import * as path from "path";
import {startCrawljax} from "@darcher/crawljax/scripts";
import * as fs from "fs";
import * as child_process from "child_process";
import * as os from "os";
import {Darcher} from "@darcher/analyzer";
import {AnalyzerConfig, ControllerOptions, DBMonitorConfig, DBOptions} from "@darcher/config/dist";
import {WebDriver} from "selenium-webdriver";
import DBMonitor from "@darcher/dbmonitor";

export interface ExperimentConfig {
    dappName: string,
    crawljaxClassName: string,
    resultDir: string,
    composeFile: string,

    txController: ControllerOptions,
    analyzerConfig: AnalyzerConfig,
    dockerStartWaitingTime: number,

    timeBudget: number,
    numRounds: number,

    // metamask
    metamaskUrl: string,
    metamaskPassword: string,
    metamaskNetwork: string,
    metamaskAccount: string,

    // chrome
    chromeUserDir: string,
    chromeDebugPort: number,

    // off-chain state
    dbMonitorConfig: DBMonitorConfig,

    // hooks
    beforeAllRoundsHook?: (logger: Logger) => Promise<void>,
    beforeStartRoundHook?: (logger: Logger) => Promise<void>,
    beforeStartDockerHook?: (logger: Logger, webDriver: WebDriver) => Promise<void>,
    beforeStartCrawljaxHook?: (logger: Logger, webDriver: WebDriver, darcher: Darcher) => Promise<void>,
    afterRoundFinishHook?: (logger: Logger) => Promise<void>,
}

function getOsEnv(): { dockerHostAddress: string, ethashDir: string } {
    switch (os.type()) {
        case "Darwin":
            return {
                dockerHostAddress: "host.docker.internal",
                // ethashDir: "~/Library/Ethash",
                ethashDir: path.join(__dirname, "..", "..", "..", "ethash"),
            }
        case "Linux":
            return {
                dockerHostAddress: "172.17.0.1",
                // ethashDir: "~/.ethash",
                ethashDir: path.join(__dirname, "..", "..", "..", "ethash"),
            }
    }
}

async function startDocker(config: ExperimentConfig, roundDataDir: string) {
    child_process.spawnSync("docker-compose", ["-f", config.composeFile, "up", "-d"], {
        env: Object.assign(process.env, {
            ETHMONITOR_CONTROLLER: config.txController,
            ANALYZER_ADDR: getOsEnv().dockerHostAddress + ":" + config.analyzerConfig.grpcPort,
            ETHASH: getOsEnv().ethashDir,
            COVERAGE_DIR: path.join(roundDataDir, "coverage"),
        }),
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
    });
    await sleep(config.dockerStartWaitingTime);
}

async function stopDocker(config: ExperimentConfig) {
    child_process.spawnSync("docker-compose", ["-f", config.composeFile, "down"], {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
    });
}

export async function startExperiment(config: ExperimentConfig) {
    const logger = new Logger(config.dappName, "debug");

    // start chrome
    const browser = new Browser(logger, config.chromeDebugPort, config.chromeUserDir);
    await browser.start();

    async function oneRound() {
        const cleanUpTasks: (() => Promise<void>)[] = [];
        const doCleanUp = async () => {
            logger.info("Cleaning up...");
            while (cleanUpTasks.length > 0) {
                const cleanUpTask = cleanUpTasks.shift();
                await cleanUpTask();
            }
        }
        process.on("beforeExit", async () => {
            await doCleanUp();
        });

        const dataDir: string | undefined = path.join(config.resultDir, `${(() => {
            const now = new Date();
            return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}=${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
        })()}`);
        if (!fs.existsSync(dataDir)) {
            logger.info("Creating data dir", {dataDir: dataDir});
            fs.mkdirSync(dataDir, {recursive: true});
            fs.mkdirSync(path.join(dataDir, "coverage"));
        }

        // start docker
        config.beforeStartDockerHook && await config.beforeStartDockerHook(logger, browser.driver);
        logger.info("Starting docker...");
        await startDocker(config, dataDir);
        cleanUpTasks.push(async () => {
            logger.info("Stopping docker...");
            await stopDocker(config);
        });

        // clear MetaMask data
        logger.info("Clearing MetaMask data...");
        await new MetaMask(logger, browser.driver, config.metamaskUrl, config.metamaskPassword)
            .changeNetwork(config.metamaskNetwork)
            .changeAccount(config.metamaskAccount)
            .resetAccount()
            .do();


        // start darcher
        logger.info("Starting DArcher...");
        const darcherService = new Darcher(logger, {
            analyzer: config.analyzerConfig,
            dbMonitor: config.dbMonitorConfig,
            clusters: [],
            logDir: dataDir,
        });
        await darcherService.start();
        cleanUpTasks.push(async () => {
            logger.info("Stopping DArcher...");
            await darcherService.shutdown();
        });

        // start dbmonitor if necessary
        let dbMonitor: DBMonitor | undefined = undefined;
        switch (config.dbMonitorConfig.db) {
            case DBOptions.mongoDB:
                logger.info("Starting dbmonitor for mongodb", {
                    dbAddress: config.dbMonitorConfig.dbAddress,
                    dbName: config.dbMonitorConfig.dbName
                });
                dbMonitor = new DBMonitor(logger, {
                    analyzer: config.analyzerConfig,
                    dbMonitor: config.dbMonitorConfig,
                    clusters: [],
                    logDir: dataDir,
                });
                await dbMonitor.start();
                cleanUpTasks.push(async () => {
                    logger.info("Stopping dbmonitor...");
                    await dbMonitor.shutdown();
                });
                break;
            case DBOptions.indexedDB:
            case DBOptions.html:
                logger.info("Requires dbmonitor browser extension.");
                break;
        }

        // start crawljax
        config.beforeStartCrawljaxHook && await config.beforeStartCrawljaxHook(logger, browser.driver, darcherService);
        logger.info("Starting crawljax...");
        await startCrawljax(logger, `localhost:${config.chromeDebugPort}`, config.metamaskUrl, config.metamaskPassword,config.crawljaxClassName, config.timeBudget, dataDir);

        const time = config.analyzerConfig.txStateChangeProcessTime ? config.analyzerConfig.txStateChangeProcessTime : 15000;
        await sleep(time * 6);

        await doCleanUp();
    }


    config.beforeAllRoundsHook && await config.beforeAllRoundsHook(logger);
    for (let i = 0; i < config.numRounds; i++) {
        logger.info("Starting experiment round", {round: i});
        config.beforeStartRoundHook && await config.beforeStartRoundHook(logger);
        await oneRound();
        config.afterRoundFinishHook && await config.afterRoundFinishHook(logger);
        logger.info("Experiment round finishes", {round: i});
    }

    await browser.shutdown();
}

export const baseConfig = {
    txController: ControllerOptions.darcher,
    dockerStartWaitingTime: 10000,

    timeBudget: 3600,
    numRounds: 1,

    // metamask
    metamaskUrl: "chrome-extension://omcfdmdoacelhhhjehbcdgmogdpfkipc/home.html",
    metamaskPassword: "12345678",

    // chrome
    chromeUserDir: path.join(__dirname, "..", "..", "..", "ChromeProfile"),
    chromeDebugPort: 9222,
};

if (require.main === module) {
    (async () => {

    })().catch(e => console.error(e));
}
