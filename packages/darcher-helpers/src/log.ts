import * as log4js from "log4js";
import {DarcherError, DarcherErrorCode} from "./error";
import {EventEmitter} from "events";
import {$enum} from "ts-enum-util";

export class Logger extends EventEmitter {

    private logger: log4js.Logger;
    private _module: string;

    constructor(_module?: string) {
        super();
        this._module = _module;
        this.logger = log4js.getLogger();
        // add an empty error listener to prevent error being thrown, see https://nodejs.org/api/events.html#events_error_events
        this.on("error", function () {
        });
    }

    get level(): string {
        return this.logger.level;
    }

    set level(lvl: string) {
        this.logger.level = lvl;
    }

    public info(msg: string, ...args: any[]) {
        this.logger.info(`[${this._module}] ${msg}`, ...args);
    }

    public debug(msg: string, ...args: any[]) {
        this.logger.debug(`[${this._module}] ${msg}`, ...args);
    }

    public warn(msg: string, ...args: any[]) {
        this.logger.warn(`[${this._module}] ${msg}`, ...args);
    }

    public error(e: DarcherError) {
        this.emit("error", e.code);
        this.logger.error(`[${this._module}] [${$enum(DarcherErrorCode).getKeyOrDefault(e.code, "Unknown")}] ${e.message}`);
    }
}

