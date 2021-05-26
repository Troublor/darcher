import {AnalyzerConfig, ControllerOptions, DBMonitorConfig, DBOptions} from "@darcher/config/dist";
import {Browser, Logger, MetaMask, sleep} from "@darcher/helpers";
import {WebDriver} from "selenium-webdriver";
import * as os from "os";
import child_process from "child_process";
import * as fs from "fs";
import {Darcher} from "@darcher/analyzer";
import DBMonitor from "@darcher/dbmonitor";
import {startCrawljax} from "@darcher/crawljax";
import * as path from "path";

export interface RunConfig {
    dappName: string,
    crawljaxClassName: string,
    resultDir: string,
    timeBudget: number,

    analyzerConfig: AnalyzerConfig,

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

export async function start(config: RunConfig) {
    const logger = new Logger(config.dappName, "debug");

    // start chrome
    const browser = new Browser(logger, config.chromeDebugPort, config.chromeUserDir);
    await browser.start();

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
    logger.info("Starting crawljax...");
    await startCrawljax(logger, `localhost:${config.chromeDebugPort}`, config.metamaskUrl, config.metamaskPassword, config.crawljaxClassName, config.timeBudget, dataDir);

    const time = config.analyzerConfig.txStateChangeProcessTime ? config.analyzerConfig.txStateChangeProcessTime : 15000;
    await sleep(time * 6);

    await doCleanUp();

    await browser.shutdown();
}

export const baseConfig: RunConfig = {
    dappName: "DApp",
    crawljaxClassName: "DArcherDefault",
    resultDir: path.join(__dirname, "..", "results"),
    timeBudget: 10 * 60,

    analyzerConfig: {
        grpcPort: 1234,
        wsPort: 1235,
        traceStorePort: 1236,
        txStateChangeProcessTime: 15 * 1000, // milliseconds
    },


    // metamask
    metamaskUrl: "chrome-extension://omcfdmdoacelhhhjehbcdgmogdpfkipc/home.html",
    metamaskPassword: "12345678",
    metamaskNetwork: "Localhost 8545",
    metamaskAccount: "Account 0",

    // chrome
    chromeUserDir: path.join(__dirname, "..", "ChromeProfile"),
    chromeDebugPort: 9222,

    dbMonitorConfig: {
        db: DBOptions.html,
        dbName: "html",
        dbAddress: "localhost:3000",
        elements: [
            {
                name: "DOM Body",
                xpath: "//*[@id=\"body\"]",
            },
        ]
    }
};

if (require.main === module) {
    let runConfigFile: string;
    if (process.argv.length < 3) {
        console.warn("Using default run configuration file: run-configuration.json");
        runConfigFile = path.join(__dirname, "..", "run-configuration.json");
    } else {
        runConfigFile = process.argv[2];
    }
    const runConfig: RunConfig = Object.assign(baseConfig, JSON.parse(fs.readFileSync(runConfigFile, {encoding: "utf-8"})));
    start(runConfig).catch(console.error);
}
