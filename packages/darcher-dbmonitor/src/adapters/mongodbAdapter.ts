import Adapter from "./adapter";
import {DBContent, TableContent} from "@darcher/rpc";
import {MongoClient} from "mongodb";
import {BadConfigurationError} from "@darcher/helpers";

export class MongodbAdapter implements Adapter {
    private readonly dbAddress: string;
    private mongoClient: MongoClient;

    constructor(dbAddress: string) {
        this.dbAddress = dbAddress;
        this.mongoClient = new MongoClient(this.dbAddress, {
            useUnifiedTopology: true,
            connectTimeoutMS: 500,
            serverSelectionTimeoutMS: 500,
        });
    }

    async connect(): Promise<Adapter> {
        return new Promise<Adapter>((resolve, reject) => {
            this.mongoClient.connect()
                .then(async () => {
                    resolve(this);
                })
                .catch((e: Error) => {
                    reject(new BadConfigurationError(e, "cannot connect to mongodb"));
                });
        });
    }

    async close(): Promise<void> {
        return this.mongoClient.close();
    }

    async getAllData(dbName: string): Promise<DBContent> {
        const dbContent = new DBContent();
        const collections = await this.mongoClient.db(dbName).collections();
        for (const collection of collections) {
            const tableContent = new TableContent();
            // _id is preserved primary key in mongodb
            tableContent.setKeypathList(["_id"]);
            const arr = await collection.find({}).toArray();
            for (const item of arr) {
                tableContent.addEntries(JSON.stringify(item));
            }
            dbContent.getTablesMap().set(collection.collectionName, tableContent);
        }
        return Promise.resolve(dbContent);
    }

}
