import {MongoClient} from "mongodb";
import {expect} from "chai";
import {MongodbAdapter} from "../src/adapters/mongodbAdapter";

describe("mongodb", () => {
    it('should be able to connect', async function () {
        const mongoClient = new MongoClient("mongodb://localhost:27017", {
            useUnifiedTopology: true,
        });
        await mongoClient.connect();
        let dbs = await mongoClient.db().admin().listDatabases();
        expect(dbs.databases).length.to.be.greaterThan(0);
        await mongoClient.close();
    });
    it('should adapter getAllData work', async function () {
        let adapter = new MongodbAdapter("mongodb://localhost:27017");
        await adapter.connect();
        let dbContent = await adapter.getAllData("giveth");
        // giveth database should have 10 collections
        expect(dbContent.getTablesMap().getLength()).to.be.equal(10);
        await adapter.close();
    });
});