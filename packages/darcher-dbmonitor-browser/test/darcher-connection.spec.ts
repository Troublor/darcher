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
        await darcher.dbMonitorService.refreshPage("localhost:63343");
    });

    test("fetch DApp state", async () => {
        const dbContent = await darcher.dbMonitorService.getAllData("localhost:63343", "html", JSON.stringify([
            {
                name: "test",
                xpath: "//div[1]"
            }
        ]));
        expect(dbContent.getTablesMap().getLength()).toBe(1);
        expect(dbContent.getTablesMap().get("html")).not.toBe(undefined);
        expect(dbContent.getTablesMap().get("html").getEntriesList().length).toBe(1);
        const entry = JSON.parse(dbContent.getTablesMap().get("html").getEntriesList()[0]);
        expect(entry["test"]).not.toBe(undefined);
        expect(entry["test"]).toBe("Nicolas has shoe size 8");
    })
})


