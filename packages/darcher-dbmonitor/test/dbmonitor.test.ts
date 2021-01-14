import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {expect} from "chai";
import * as sinon from "sinon";
import {Client} from "../src/client";
import {getUUID, Logger, ServiceNotAvailableError, sleep} from "@darcher/helpers";
import {Config, DBOptions} from "@darcher/config";
import {DarcherServer} from "@darcher/analyzer/src/service";
import DBMonitor from "../src";

describe("dbmonitor", () => {
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
    let darcherServer: DarcherServer;
    let dbmonitor: DBMonitor;

    beforeAll(async () => {
        return chai.use(chaiAsPromised);
    });

    it("should throw exception when analyzer is not available", async function () {
        const eventSpy = sinon.spy();
        const client = new Client(logger, "localhost:5242");
        logger.once("error", eventSpy);
        client.serveGetAllDataControl(null);
        await sleep(200);
        expect(eventSpy.called).to.be.true;
        const e = eventSpy.args[0][0];
        expect(e).to.be.instanceOf(ServiceNotAvailableError);
        await client.shutdown();
    });
    it("should successfully connect to darcherServer", async function () {
        const eventSpy = sinon.spy();
        logger.on("error", eventSpy);
        darcherServer = new DarcherServer(logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        await darcherServer.start();
        dbmonitor = new DBMonitor(logger, config);
        await dbmonitor.start();
        await darcherServer.dbMonitorService.waitForEstablishment();
        await sleep(200);
        expect(eventSpy.called).to.be.false;
        // try getAllData
        await expect(darcherServer.dbMonitorService.getAllData(config.dbMonitor.dbAddress, config.dbMonitor.dbName)).not.to.be.eventually.rejected;
        await dbmonitor.shutdown();
        await darcherServer.shutdown();
    });
});
