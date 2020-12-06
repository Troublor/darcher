import {DarcherError, DarcherErrorCode, loadConfig, Logger, Service} from "@darcher/helpers";
import * as path from "path";
import {Darcher} from "@darcher/analyzer/src";
import {Config} from "@darcher/config/dist";

export class DarcherService implements Service {
    private darcher: Darcher;

    constructor(
        private readonly logger: Logger,
        private readonly config: Config,
        private readonly dataDir?: string
    ) {
    }

    async shutdown(): Promise<void> {
        await this.darcher.shutdown();
    }

    async start(): Promise<void> {
        // override log/data dir
        if (this.dataDir) {
            this.config.logDir = this.dataDir;
        }

        this.darcher = new Darcher(this.logger, this.config);
        // start darcher
        await this.darcher.start();
    }

    async waitForEstablishment(): Promise<void> {
        return Promise.resolve();
    }

}

if (require.main === module) {
    (async () => {
        const logger = new Logger("MetaMaskExperiment", "debug");
        const config = await loadConfig(path.join(__dirname, "config", "lordsofthesnails.config.ts"));
        const service = new DarcherService(logger, config);
        try {
            await service.start();

            await Promise.race([
                new Promise(resolve => process.on("SIGINT", resolve)),
                new Promise(resolve => process.on("SIGTERM", resolve)),
                new Promise(resolve => process.on("SIGHUP", resolve)),
            ]);
        } catch (e) {
            logger.error(new DarcherError(DarcherErrorCode.Raw, e.toString()));
        } finally {
            await service.shutdown();
        }
    })()

}
