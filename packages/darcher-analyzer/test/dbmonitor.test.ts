import {Config, DBOptions} from "@darcher/config";
import {Logger, sleep} from "@darcher/helpers";
import DBMonitor from "@darcher/dbmonitor";
import {DarcherServer} from "../src/service";
import {expect} from "chai";
import * as chai from "chai";
import * as sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import {MockWsClient} from "./utils/mock_client";

describe("dbmonitor service", () => {

    const config: Config = {
        analyzer: {
            grpcPort: 1234,
            wsPort: 1235,
        },
        dbMonitor: {
            db: DBOptions.mongoDB,
            dbAddress: "mongodb://localhost:27017",
            dbName: "giveth",
        },
        clusters: [],
    };
    const logger = new Logger("dbmonitor_test");
    logger.level = "off";

    beforeAll(async () => {
        chai.use(chaiAsPromised);
    });

    it("should successfully getAllData", async () => {
        const darcherServer: DarcherServer = new DarcherServer(logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        const dbmonitor: DBMonitor = new DBMonitor(logger, config);
        await darcherServer.start();
        await dbmonitor.start();
        await darcherServer.dbMonitorService.waitForEstablishment();

        await darcherServer.dbMonitorService.getAllData(config.dbMonitor.dbAddress, config.dbMonitor.dbName);

        await dbmonitor.shutdown();
        await darcherServer.shutdown();
    });

    it("should give warning when try to establish an already established service", async function () {
        const darcherServer: DarcherServer = new DarcherServer(logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        const dbmonitor: DBMonitor = new DBMonitor(logger, config);
        await darcherServer.start();
        await dbmonitor.start();
        await darcherServer.dbMonitorService.waitForEstablishment();

        const eventSpy = sinon.spy();
        logger.on("warn", eventSpy);
        darcherServer.dbMonitorService.grpcTransport.getAllDataControl(null);
        await sleep(100);
        expect(eventSpy.called).to.be.true;
        expect(eventSpy.args[0][0]).to.contain("already established");

        await dbmonitor.shutdown();
        await darcherServer.shutdown();
    });

    it("should websocket transport getAddData", async function () {
        const darcherServer: DarcherServer = new DarcherServer(logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        const wsMockClient = new MockWsClient(logger, `ws://localhost:${config.analyzer.wsPort}`);
        await darcherServer.start();
        await wsMockClient.start();
        await darcherServer.dbMonitorService.waitForEstablishment();

        const content = await darcherServer.dbMonitorService.getAllData(config.dbMonitor.dbAddress, config.dbMonitor.dbName);
        expect(content.getTablesMap().has("mock")).to.be.true;

        await wsMockClient.shutdown();
        await darcherServer.shutdown();
    });

    it("should websocket transport refresh page", async function () {
        const darcherServer: DarcherServer = new DarcherServer(logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        const wsMockClient = new MockWsClient(logger, `ws://localhost:${config.analyzer.wsPort}`);
        await darcherServer.start();
        await wsMockClient.start();
        await darcherServer.dbMonitorService.waitForEstablishment();

        await expect(darcherServer.dbMonitorService.refreshPage(config.dbMonitor.dbAddress)).not.to.be.rejected;

        await wsMockClient.shutdown();
        await darcherServer.shutdown();
    });
});
