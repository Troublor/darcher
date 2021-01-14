export type LoggerLevel = number;

export class Logger {
    public static Level = {
        DEBUG: 1,
        INFO: 2,
        WARN: 3,
        ERROR: 4,
        levelString: (lvl: LoggerLevel) => {
            switch (lvl) {
            case 1:
                return "DEBUG";
            case 2:
                return "INFO";
            case 3:
                return "WARN";
            case 4:
                return "ERROR";
            default:
                return "UNKNOWN";
            }
        },
    }

    constructor(
        private readonly module: string,
        private readonly level: LoggerLevel,
    ) {
    }

    private parseLog(level: LoggerLevel, message: string, context?: { [key: string]: any }): string {
        const now = new Date();
        const month = now.getMonth().toString().padStart(2, "0");
        const day = now.getDay().toString().padStart(2, "0");
        const hour = now.getHours().toString().padStart(2, "0");
        const minute = now.getMinutes().toString().padStart(2, "0");
        const second = now.getSeconds().toString().padStart(2, "0");
        const millisecond = now.getMilliseconds().toString().padEnd(3, "0").slice(0, 3);
        const logTime = `${month}-${day}|${hour}:${minute}:${second}.${millisecond}`;

        const colored = (level: LoggerLevel, payload: string): string => {
            // TODO coloring in Browser Console
            return payload;
        };

        let contextLiteral = "";
        if (context) {
            for (const key in context) {
                // eslint-disable-next-line no-prototype-builtins
                if (context.hasOwnProperty(key)) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    contextLiteral += `${colored(level, key)}=${context[key]?.toString()} `;
                }
            }
        }

        return `${colored(level, Logger.Level.levelString(level).padEnd(5, " "))}[${logTime}][${this.module}] ${message.toString().padEnd(48, " ")} ${contextLiteral}`;
    }

    log(level: LoggerLevel, message: string, context?: { [key: string]: any }) {
        if (this.level <= level) {
            switch (this.level) {
            case Logger.Level.ERROR:
                console.error(this.parseLog(level, message, context));
                break;
            case Logger.Level.WARN:
                console.warn(this.parseLog(level, message, context));
                break;
            case Logger.Level.INFO:
                console.info(this.parseLog(level, message, context));
                break;
            case Logger.Level.DEBUG:
                console.debug(this.parseLog(level, message, context));
                break;
            default:
                console.log(this.parseLog(level, message, context));
            }
        }
    }

    info(message: string, context?: { [key: string]: any }) {
        this.log(Logger.Level.INFO, message, context);
    }

    warn(message: string, context?: { [key: string]: any }) {
        this.log(Logger.Level.WARN, message, context);
    }

    debug(message: string, context?: { [key: string]: any }) {
        this.log(Logger.Level.DEBUG, message, context);
    }

    error(message: string, context?: { [key: string]: any }) {
        this.log(Logger.Level.ERROR, message, context);
    }
}
