import {Builder, Capabilities, WebDriver} from "selenium-webdriver";
import * as path from "path";
import {Options} from "selenium-webdriver/chrome";
import {getWebDriver, Logger, sleep} from "@darcher/helpers";

export default async function clearIndexedDB(logger: Logger, driver: WebDriver, dappUrl: string, dbNames: string[]) {
    const current = await driver.getWindowHandle();
    await driver.switchTo().newWindow('tab');
    await driver.get(dappUrl);
    await sleep(2000);
    for (const dbname of dbNames) {
        await driver.executeScript(`indexedDB.deleteDatabase("${dbname}")`);
        logger.info("Clearing IndexedDB...", {dbname: dbname});
    }
    try {
        await driver.wait(async () => {
            const dbs: { name: string }[] = await driver.executeScript("return await indexedDB.databases()");
            return !dbs.some(value => dbNames.includes(value.name));
        }, 1000);
    } catch (e) {
        logger.warn("Clearing indexedDB seems failed")
    }

    await driver.close();
    await driver.switchTo().window(current);
};

if (require.main === module) {
    (async () => {

        const driver = await getWebDriver("localhost:9222");
        await clearIndexedDB(new Logger("ClearIndexedDB", "info"), driver,
            "http://localhost:8080", [
                "augur-123456",
                "0x-mesh/mesh_dexie_db",
            ]);
    })();

}

