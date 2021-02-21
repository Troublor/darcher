import {Config, DBOptions} from "@darcher/config";
import Adapter from "./adapters/adapter";
import {MongodbAdapter} from "./adapters/mongodbAdapter";
import {Client} from "./client";
import {Logger, ReverseRPCHandler} from "@darcher/helpers";
import {GetAllDataControlMsg} from "@darcher/rpc";

export default class DBMonitor {
    private config: Config;
    private readonly logger: Logger;

    private adapter: Adapter;
    private client: Client;

    constructor(logger: Logger, config: Config) {
        this.config = config;
        this.logger = logger;
    }

    public async start(): Promise<void> {
        let analyzerAddress;
        // connect db adapter
        switch (this.config.dbMonitor.db) {
            case DBOptions.mongoDB:
                this.adapter = new MongodbAdapter(this.config.dbMonitor.dbAddress);
                await this.adapter.connect();
                analyzerAddress = `localhost:${this.config.analyzer.grpcPort}`;
        }
        // start client
        this.client = new Client(this.logger, analyzerAddress);
        this.client.serveGetAllDataControl(this.getAllDataControlHandler);
    }

    public async shutdown(): Promise<void> {
        await this.client.shutdown();
        await this.adapter.close();
    }

    getAllDataControlHandler: ReverseRPCHandler<GetAllDataControlMsg, GetAllDataControlMsg>
        = async (req): Promise<GetAllDataControlMsg> => {
        return new Promise((resolve, reject) => {
            if (!this.adapter) {
                reject("adapter is not loaded");
                return
            }
            this.adapter.getAllData(this.config.dbMonitor.dbName).then(value => {
                req.setContent(value);
                resolve(req);
            });
        });
    }
}