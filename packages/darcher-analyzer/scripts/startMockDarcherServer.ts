import {MockDarcherServer} from "../src/service";
import {Logger} from "@darcher/helpers";

const grpcPort = 1234;
const txProcessTime = 10000; // 10 seconds

const logger = new Logger("MockDarcherServer");

async function main() {
    let mockServer = new MockDarcherServer(logger, grpcPort);
    mockServer.txProcessTime = txProcessTime;
    await mockServer.start();
    process.on('SIGINT', async function () {
        console.log(">>> Caught interrupt signal");
        await mockServer.shutdown();
    });
    logger.info("waiting for reverse rpc to be established");
    await mockServer.waitForEstablishment();
}

main().then(() => {
    logger.info("MockDarcherServer started");
})