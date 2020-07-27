import Adapter from "./adapter";
import {DBContent, TableContent} from "@darcher/rpc";
import {MongoClient} from "mongodb";

export class MongodbAdapter implements Adapter {
    private readonly dbAddress: string;
    private mongoClient: MongoClient;

    constructor(dbAddress: string) {
        this.dbAddress = dbAddress;
        this.mongoClient = new MongoClient(this.dbAddress, {
            useUnifiedTopology: true,
        });
    }

    async connect(): Promise<Adapter> {
        return new Promise<Adapter>((resolve, reject) => {
            this.mongoClient.connect()
                .then(async () => {
                    resolve(this);
                })
                .catch((e: Error) => {
                    reject(e);
                });
        });
    }

    async close(): Promise<void> {
        return this.mongoClient.close();
    }

    async getAllData(dbName: string): Promise<DBContent> {
        let dbContent = new DBContent();
        const collections = await this.mongoClient.db(dbName).collections();
        for (let collection of collections) {
            let tableContent = new TableContent();
            // _id is preserved primary key in mongodb
            tableContent.setKeypathList(["_id"]);
            let arr = await collection.find({}).toArray();
            for (let item of arr) {
                tableContent.addEntries(JSON.stringify(item));
            }
            dbContent.getTablesMap().set(collection.collectionName, tableContent);
        }
        return Promise.resolve(dbContent);
    }

}