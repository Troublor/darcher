import {Config, DBOptions} from "@darcher/config";
import {getUUID, Logger} from "@darcher/helpers";
import DBMonitor from "@darcher/dbmonitor";
import {DarcherServer} from "../src/service";
import {GetAllDataControlMsg, Role} from "@darcher/rpc";
import {expect} from "chai";


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
let darcherServer: DarcherServer;
let dbmonitor: DBMonitor;
describe("connection with dbmonitor", async () => {

    before(async () => {
        darcherServer = new DarcherServer(logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        dbmonitor = new DBMonitor(logger, config);
        await darcherServer.start();
        await dbmonitor.start();
        await darcherServer.waitForRRPCEstablishment();
    })


    after(async () => {
        await dbmonitor.shutdown();
        await darcherServer.shutdown();
    });

    it('should successfully getAllData', async () => {
        let req = new GetAllDataControlMsg();
        req.setRole(Role.DBMONITOR)
            .setId(getUUID())
            .setDbAddress(config.dbMonitor.dbAddress)
            .setDbName(config.dbMonitor.dbName);
        let resp = await darcherServer.dbMonitorServiceViaGRPC.getAllData(req);
        expect(resp.getContent().getTablesMap().getLength()).to.be.equal(10);
    });

});