import * as log4js from "log4js";
import {DarcherError, DarcherErrorCode} from "./error";
import {EventEmitter} from "events";
import {$enum} from "ts-enum-util";
import * as chalk from "chalk";
import {Level} from "log4js";

log4js.addLayout('darcherConsole', config => {
    return logEvent => {
        const month = logEvent.startTime.getMonth().toString().padStart(2, "0");
        const day = logEvent.startTime.getDay().toString().padStart(2, "0");
        const hour = logEvent.startTime.getHours().toString().padStart(2, "0");
        const minute = logEvent.startTime.getMinutes().toString().padStart(2, "0");
        const second = logEvent.startTime.getSeconds().toString().padStart(2, "0");
        const millisecond = logEvent.startTime.getMilliseconds().toString().padEnd(3, "0").slice(0, 3);
        const logTime = `${month}-${day}|${hour}:${minute}:${second}.${millisecond}`;
        const msg = logEvent.data[0];
        const context: object = logEvent.data[1];
        let contextLiteral = "";
        const colored = (level: Level, str: string): string => {
            switch (level) {
                case log4js.levels.TRACE:
                    return chalk.blue(str);
                case log4js.levels.DEBUG:
                    return chalk.cyan(str);
                case log4js.levels.INFO:
                    return chalk.green(str);
                case log4js.levels.WARN:
                    return chalk.yellow(str);
                case log4js.levels.ERROR:
                    return chalk.red(str);
                case log4js.levels.FATAL:
                    return chalk.magenta(str);
                default:
                    return str;
            }
        }
        for (let key in context) {
            if (context.hasOwnProperty(key)) {
                // @ts-ignore
                contextLiteral += `${colored(logEvent.level, key)}=${context[key].toString()} `;
            }
        }
        return `${colored(logEvent.level, logEvent.level.levelStr.padEnd(5, " "))}[${logTime}][${logEvent.categoryName}] ${msg.padEnd(48, " ")} ${contextLiteral}`;
    };
});
log4js.configure({
    appenders: {
        console: {
            type: 'stdout',
            layout: {
                type: "darcherConsole",
                separator: "",
            }
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'trace',
        }
    }
})

export class Logger extends EventEmitter {

    private logger: log4js.Logger;
    private _module: string;

    constructor(_module?: string, level?: string | log4js.Level) {
        super();
        this.logger = log4js.getLogger(_module);
        this.logger.level = 'info'; // set default level at "info"
        if (level) {
            this.logger.level = typeof level === "string" ? level : level.levelStr;
        }
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

    public info(msg: string, context?: { [key: string]: any }) {
        this.emit("info", msg, context);
        this.logger.info(`${msg}`, context);
    }

    public debug(msg: string, context?: { [key: string]: any }) {
        this.emit("debug", msg, context);
        this.logger.debug(`${msg}`, context);
    }

    public warn(msg: string, context?: { [key: string]: any }) {
        this.emit("warn", msg, context);
        this.logger.warn(`${msg}`, context);
    }

    public error(e: DarcherError) {
        this.emit("error", e);
        this.logger.error(e.message, {type: $enum(DarcherErrorCode).getKeyOrDefault(e.code, "Unknown")});
    }
}

