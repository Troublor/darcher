import {MockDarcherServer} from "../src/service";
import {Logger} from "@darcher/helpers";
import {Config, DBOptions} from "@darcher/config";

const txProcessTime = 10000; // 10 seconds

const logger = new Logger("MockDarcherServer");
logger.level = "debug";

const config = <Config>{
    analyzer: {
        grpcPort: 1234,
        wsPort: 1235,
    },
    dbMonitor: {
        db: DBOptions.indexedDB,
        dbAddress: "localhost:8080",
        dbName: "augur-123456",
    },
    clusters: [],
};

async function main() {
    const mockServer = new MockDarcherServer(logger, config);
    mockServer.txProcessTime = txProcessTime;
    await mockServer.start();
    process.on("SIGINT", async function () {
        console.log(">>> Caught interrupt signal");
        await mockServer.shutdown();
    });
}

main().then(() => {
    logger.info("MockDarcherServer started");
});
