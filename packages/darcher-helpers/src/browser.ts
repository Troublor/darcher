import {Service} from "./service";
import {Options} from "selenium-webdriver/chrome";
import {Builder, By, until, WebDriver} from "selenium-webdriver";
import {Logger} from "./log";
import * as path from "path";
import {sleep} from "./utility";

const pathToWebDriver = path.join(__dirname, "..", "webdriver");
if (!process.env.PATH.includes(pathToWebDriver)) {
    process.env.PATH += `:${pathToWebDriver}`;
}

export class Browser implements Service {
    private _driver: WebDriver | null;

    constructor(
        private readonly logger: Logger,
        private readonly port: number,
        private readonly userDir: string,
    ) {
    }

    async start() {
        const options = new Options()
            .addArguments(
                "--args",
                `--user-data-dir=${this.userDir}`,
                "--disable-web-security",
                "--enable-experimental-web-platform-features",
                `--remote-debugging-port=${this.port}`
            )

        this.logger.info("Starting chrome...", {port: this.port, userDir: this.userDir});

        this._driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();
        console.log("start");
    }

    async waitForEstablishment(): Promise<void> {
        return Promise.resolve();
    }

    async shutdown(): Promise<void> {
        if (!this._driver) {
            this.logger.info("Chrome already shutdown");
            return;
        }
        this.logger.info("Stopping chrome...");
        await this._driver.quit();
    }

    get driver(): WebDriver | null {
        return this._driver;
    }
}

export async function getWebDriver(debuggerAddress: string): Promise<WebDriver> {
    const options = new Options()
    // @ts-ignore
    options.options_["debuggerAddress"] = debuggerAddress;

    return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

export class MetaMask {
    private readonly taskQueue: (() => Promise<void>)[] = [];

    constructor(
        private readonly logger: Logger,
        private readonly driver: WebDriver,
        private readonly homeUrl: string,
        private readonly password: string,
    ) {
    }

    changeNetwork(name: string): MetaMask {
        this.taskQueue.push(
            async () => {
                this.logger.info("Changing MetaMask network...", {network: name});
                const element = await this.driver.findElement(By.className("network-component"));
                await element.click();
                const dropDown = await this.driver.wait(until.elementLocated(By.className("network-droppo")));
                const networkItems = await dropDown.findElements(By.css("li"));
                for (const network of networkItems) {
                    const text = await network.getText()
                    if (!text.includes(name)) {
                        continue;
                    }
                    await network.click();
                    await this.driver.wait(until.elementTextContains(
                        await this.driver.findElement(By.className("network-name")),
                        name,
                    ));
                    break;
                }
            },
        )
        return this;
    }

    changeAccount(accName: string): MetaMask {
        this.taskQueue.push(async () => {
            this.logger.info("Changing MetaMask account...", {account: accName});
            const element = await this.driver.findElement(By.className("account-menu__icon"));
            await element.click();
            const dropDown = await this.driver.wait(until.elementLocated(By.className("account-menu")));
            const accountItems = await dropDown.findElements(By.className("account-menu__account"));
            for (const account of accountItems) {
                try {
                    const name = await account.findElement(By.className("account-menu__name"));
                    const text = await name.getText();
                    if (!text.includes(accName)) {
                        continue;
                    }
                    await account.click();
                    await this.driver.wait(until.elementTextContains(
                        await this.driver.findElement(By.className("selected-account__name")),
                        accName,
                    ), 1000);
                    break;
                } catch (e) {
                    console.error(e);
                }
            }
        });
        return this;
    }

    resetAccount(): MetaMask {
        this.taskQueue.push(async () => {
            this.logger.info("Resetting MetaMask account...");
            const element = await this.driver.findElement(By.className("account-menu__icon"));
            await element.click();
            const dropDown = await this.driver.wait(until.elementLocated(By.className("account-menu")));
            const menuItems = await dropDown.findElements(By.className("account-menu__item"));
            for (const item of menuItems) {
                const text = await item.getText();
                if (text.includes("Settings")) {
                    await item.click();
                    await this.driver.wait(until.elementLocated(By.className("settings-page")));
                    const tabs = await this.driver.findElements(By.className("tab-bar__tab"));
                    for (const tab of tabs) {
                        const titleElement = await tab.findElement(By.className("tab-bar__tab__content__title"));
                        const title = await titleElement.getText();
                        if (title === 'Advanced') {
                            await tab.click();
                            await this.driver.wait(until.elementTextContains(
                                await this.driver.findElement(By.className("settings-page__subheader")),
                                "Advanced",
                            ));
                            const resetBtn = await this.driver.findElement(By.xpath("//BUTTON[text()='Reset Account']"));
                            await resetBtn.click();
                            const btn = await this.driver.wait(until.elementLocated(By.xpath("//BUTTON[text()='Reset']")));
                            await btn.click();
                            await sleep(500);
                            return;
                        }
                    }
                }
            }
        });
        return this;
    }

    async do(): Promise<void> {
        this.logger.info("Opening MetaMask home page...", {url: this.homeUrl})
        const current = await this.driver.getWindowHandle();
        await this.driver.switchTo().newWindow('tab');
        await this.driver.get(this.homeUrl);
        await this.driver.wait(async () => {
            const state = await this.driver.executeScript("return document.readyState");
            return state == "complete";
        });
        await sleep(500);
        // unlock MetaMask if necessary
        try {
            const unlockButton = await this.driver.findElement(By.xpath("//BUTTON[.='Unlock']"));
            const passwordInput = await this.driver.findElement(By.id("password"));
            await passwordInput.sendKeys(this.password);
            await unlockButton.click();
            await this.driver.wait(until.elementLocated(By.className("main-container")));
        } catch (e) {
        }

        for (const task of this.taskQueue) {
            await task();
        }
        await this.driver.close();
        await this.driver.switchTo().window(current);
        this.logger.info("Metamask task complete");
    }
}

if (require.main === module) {
    (async () => {
        const logger = new Logger("Browser", "debug");
        const browser = new Browser(logger, 9222, "/Users/troublor/workspace/darcher_mics/browsers/Chrome/UserData");
        await browser.start();
        // const driver = await getWebDriver("127.0.0.1:9222");
        // const metamask = new MetaMask(logger, driver, "chrome-extension://jbppcachblnkaogkgacckpgohjbpcekf/home.html", "12345678")
        // await metamask.changeAccount("Account 1")
        //     .changeNetwork("Rinkeby")
        //     .resetAccount()
        //     .do();
    })()
}
