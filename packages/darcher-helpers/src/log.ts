import * as log4js from "log4js";

export class Logger {

    private logger: log4js.Logger;
    private module: string;

    constructor(module?: string) {
        this.module = module;
        this.logger = log4js.getLogger();
    }

    get level(): string {
        return this.logger.level;
    }

    set level(lvl: string) {
        this.logger.level = lvl;
    }

    public info(msg: string, ...args: any[]) {
        this.logger.info(`[${module}] ${msg}`, ...args);
    }

    public debug(msg: string, ...args: any[]) {
        this.logger.debug(`[${module}] ${msg}`, ...args);
    }

    public warn(msg: string, ...args: any[]) {
        this.logger.warn(`[${module}] ${msg}`, ...args);
    }

    public error(msg: string, ...args: any[]) {
        this.logger.error(`[${module}] ${msg}`, ...args);
    }
}

