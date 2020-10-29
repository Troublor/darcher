import {DarcherServer} from "@darcher/analyzer/src/service";
import {Logger} from "@darcher/helpers";

describe("DArcher Connection", () => {
    const logger = new Logger("dbmonitor-browser test", 'debug')

    let darcher: DarcherServer;

    beforeEach(async () => {
        darcher = new DarcherServer(logger, 1234, 1235);
        await darcher.start();
        await darcher.dbMonitorService.waitForEstablishment();
    })

    afterEach(async () => {
        await darcher.shutdown();
    })

    test("refresh", async () => {
        await darcher.dbMonitorService.refreshPage("www.google.com");
    });

    test("fetch DApp state", async () => {
        // await darcher.dbMonitorService.getAllData()
    })
})


