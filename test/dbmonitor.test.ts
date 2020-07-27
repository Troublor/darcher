import {Config, DBOptions} from "@darcher/config";
import DBMonitor from "@darcher/dbmonitor";

describe("dbmonitor", () => {
    let config: Config = {
        analyzer: {
            grpcPort: 1234,
            wsPort: 1235,
        },
        dbMonitor: {
            db: DBOptions.mongoDB,
            dbAddress: "localhost:27017",
            dbName: "giveth",
        },
        clusters: []
    };
})