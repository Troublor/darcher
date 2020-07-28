import {Config, DBOptions} from "@darcher/config";
import {getUUID, Logger, sleep} from "@darcher/helpers";
import DBMonitor from "@darcher/dbmonitor";
import {DarcherServer} from "../src/service";
import {GetAllDataControlMsg, Role} from "@darcher/rpc";
import {expect} from "chai";
import * as sinon from "sinon";

describe("dbmonitor service", async () => {
    let config: Config = {
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
    }
    let logger = new Logger("dbmonitor_test");
    logger.level = "off";
    let darcherServer: DarcherServer;
    let dbmonitor: DBMonitor;

    before(async () => {
        darcherServer = new DarcherServer(logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        dbmonitor = new DBMonitor(logger, config);
        await darcherServer.start();
        await dbmonitor.start();
        await darcherServer.waitForEstablishment();
    });


    after(async () => {
        await dbmonitor.shutdown();
        await darcherServer.shutdown();
    });

    it('should successfully getAllData', async () => {
        let resp = await darcherServer.dbMonitorService.getAllData(config.dbMonitor.dbAddress, config.dbMonitor.dbName);
        expect(resp.getTablesMap().getLength()).to.be.equal(10);
    });

    it('should give warning when try to establish an already established service', async function () {
        let eventSpy = sinon.spy();
        logger.on("warn", eventSpy);
        darcherServer.dbMonitorService.grpcTransport.getAllDataControl(null);
        await sleep(100);
        expect(eventSpy.called).to.be.true;
        expect(eventSpy.args[0][0]).to.contain("already established");
    });

    it('should websocket transport work well', function () {

    });
});