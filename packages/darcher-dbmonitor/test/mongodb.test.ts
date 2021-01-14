import {MongoClient} from "mongodb";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {expect} from "chai";
import {MongodbAdapter} from "../src/adapters/mongodbAdapter";
import {
    BadConfigurationError,
} from "@darcher/helpers";

describe("mongodb", () => {
    beforeAll(async () => {
        chai.use(chaiAsPromised);
    });

    it("should throw exception when connect to a wrong mongodb url", async function () {
        const adapter = new MongodbAdapter("mongodb://localhost:27015");
        await expect(adapter.connect()).to.be.eventually.rejectedWith(BadConfigurationError);
    });

    it("should be able to connect", async function () {
        const mongoClient = new MongoClient("mongodb://localhost:27017", {
            useUnifiedTopology: true,
        });
        await mongoClient.connect();
        const dbs = await mongoClient.db().admin().listDatabases();
        expect(dbs.databases).length.to.be.greaterThan(0);
        await mongoClient.close();
    });
    it("should adapter getAllData work", async function () {
        const adapter = new MongodbAdapter("mongodb://localhost:27017");
        await adapter.connect();
        const dbContent = await adapter.getAllData("giveth");
        // giveth database should have 10 collections
        // expect(dbContent.getTablesMap().getLength()).to.be.equal(10);
        await adapter.close();
    });
});
