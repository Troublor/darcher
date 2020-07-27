import * as log4js from "log4js";

export class Logger {

    private logger: log4js.Logger;
    private module: string;

    constructor(module?: string) {
        this.module = module;
        this.logger = log4js.getLogger();
        this.logger.level = "debug";
    }

    public info(msg: string) {
        this.logger.info(`[${module}] ${msg}`);
    }

    public debug(msg: string) {
        this.logger.debug(`[${module}] ${msg}`);
    }

    public warn(msg: string) {
        this.logger.warn(`[${module}] ${msg}`);
    }

    public error(msg: string) {
        this.logger.error(`[${module}] ${msg}`);
    }
}

