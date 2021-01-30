import {Browser, getWebDriver, loadConfig, Logger, MetaMask, sleep} from "@darcher/helpers";
import * as path from "path";
import {WebDriver} from "selenium-webdriver";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";

async function clearLocalStorage(url: string, driver: WebDriver) {
    const currentHandle = await driver.getWindowHandle();
    await driver.switchTo().newWindow("tab");
    await driver.get(url);
    await sleep(5000);
    await driver.executeScript("localStorage.clear()");
    await driver.close();
    await driver.switchTo().window(currentHandle);
}


if (require.main === module) {
    (async () => {
        const dappUrl = "http://localhost:3000";
        const subjectDir = path.join(__dirname, "..");
        const burnerWalletConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "burner-wallet",
            crawljaxClassName: "BurnerWalletExperiment",
            resultDir: path.join(subjectDir, "results"),
            composeFile: path.join(subjectDir, "docker-compose.yml"),

            analyzerConfig: {
                grpcPort: 1234,
                wsPort: 1235,
                traceStorePort: 1236,
                txStateChangeProcessTime: 3000,
            },
            dbMonitorConfig: {
                db: DBOptions.html,
                dbName: "html",
                dbAddress: "localhost:3000",
                js: `
        JSON.stringify(localStorage)
        `
            },

            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Default0",

            beforeStartCrawljaxHook: async (logger:Logger, driver: WebDriver) => {
                logger.info("clear local storage");
                await clearLocalStorage(dappUrl, driver);
            }
        });
        await startExperiment(burnerWalletConfig);
    })().catch(e => console.error(e));
}
