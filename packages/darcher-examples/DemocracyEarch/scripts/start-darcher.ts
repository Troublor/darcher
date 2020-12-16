import {DarcherError, DarcherErrorCode, loadConfig, Logger, Service} from "@darcher/helpers";
import * as path from "path";
import {Darcher} from "@darcher/analyzer";
import {Config} from "@darcher/config/dist";
import DBMonitor from "@darcher/dbmonitor";

export class DarcherService implements Service {
    public darcher: Darcher;
    private dbMonitor: DBMonitor

    constructor(
        private readonly logger: Logger,
        private readonly config: Config,
        private readonly dataDir?: string
    ) {
    }

    async shutdown(): Promise<void> {
        await this.darcher.shutdown();
        await this.dbMonitor.shutdown();
    }

    async start(): Promise<void> {
        // override log/data dir
        if (this.dataDir) {
            this.config.logDir = this.dataDir;
        }

        this.darcher = new Darcher(this.logger, this.config);
        this.dbMonitor = new DBMonitor(this.logger, this.config);
        // start darcher
        await this.darcher.start();
        await this.dbMonitor.start();
    }

    async waitForEstablishment(): Promise<void> {
        return Promise.resolve();
    }

}

if (require.main === module) {
    (async () => {
        const logger = new Logger("Experiment", "debug");
        const config = await loadConfig(path.join(__dirname, "config", "sovereign.config.ts"));
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
