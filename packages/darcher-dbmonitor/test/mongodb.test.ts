import {MongoClient} from "mongodb";
import {expect} from "chai";
import {MongodbAdapter} from "../src/adapters/mongodbAdapter";

describe("mongodb", () => {
    it('should be able to connect', function () {
        const mongoClient = new MongoClient("mongodb://localhost:27017", {
            useUnifiedTopology: true,
        });
        mongoClient.connect().then(async () => {
            let dbs = await mongoClient.db().admin().listDatabases();
            expect(dbs).length.to.be.greaterThan(0);
            await mongoClient.close();
        });
    });
    it('should adapter getAllData work', function () {
        let adapter = new MongodbAdapter("mongodb://localhost:27017");
        adapter.connect().then(async adapter => {
            let dbContent = await adapter.getAllData("giveth");
            // giveth database should have 10 collections
            expect(dbContent.getTablesMap().keys()).to.be.lengthOf(10);
            await adapter.close();
        })
    });
});