export type BrowserLoggerLevel = number;

export class BrowserLogger {
    public static Level = {
        DEBUG: 1,
        INFO: 2,
        WARN: 3,
        ERROR: 4,
        levelString: (lvl: BrowserLoggerLevel) => {
            switch (lvl) {
                case 1:
                    return 'DEBUG';
                case 2:
                    return 'INFO';
                case 3:
                    return 'WARN';
                case 4:
                    return 'ERROR';
                default:
                    return 'UNKNOWN'
            }
        }
    }

    constructor(private readonly level: BrowserLoggerLevel,
                private readonly module: string) {
    }

    private parseLog(level: BrowserLoggerLevel, message: string, context?: { [key: string]: any }): string {
        const now = new Date();
        const month = now.getMonth().toString().padStart(2, "0");
        const day = now.getDay().toString().padStart(2, "0");
        const hour = now.getHours().toString().padStart(2, "0");
        const minute = now.getMinutes().toString().padStart(2, "0");
        const second = now.getSeconds().toString().padStart(2, "0");
        const millisecond = now.getMilliseconds().toString().padEnd(3, "0").slice(0, 3);
        const logTime = `${month}-${day}|${hour}:${minute}:${second}.${millisecond}`;

        const colored = (level: BrowserLoggerLevel, payload: string): string => {
            // TODO coloring in Browser Console
            return payload;
        };

        let contextLiteral = "";
        if (context) {
            for (let key in context) {
                if (context.hasOwnProperty(key)) {
                    // @ts-ignore
                    contextLiteral += `${colored(logEvent.level, key)}=${context[key].toString()} `;
                }
            }
        }

        return `${colored(level, BrowserLogger.Level.levelString(level).padEnd(5, " "))}[${logTime}][${this.module}] ${message.padEnd(48, " ")} ${contextLiteral}`;
    }

    log(level: BrowserLoggerLevel, message: string, context?: { [key: string]: any }) {
        if (this.level <= level) {
            switch (this.level) {
                case BrowserLogger.Level.ERROR:
                    console.error(this.parseLog(level, message, context));
                    break;
                case BrowserLogger.Level.WARN:
                    console.warn(this.parseLog(level, message, context));
                    break;
                case BrowserLogger.Level.INFO:
                    console.info(this.parseLog(level, message, context));
                    break;
                case BrowserLogger.Level.DEBUG:
                    console.debug(this.parseLog(level, message, context));
                    break;
                default:
                    console.log(this.parseLog(level, message, context));
            }
        }
    }

    info(message: string, context?: { [key: string]: any }) {
        this.log(BrowserLogger.Level.INFO, message, context);
    }

    warn(message: string, context?: { [key: string]: any }) {
        this.log(BrowserLogger.Level.WARN, message, context);
    }

    debug(message: string, context?: { [key: string]: any }) {
        this.log(BrowserLogger.Level.DEBUG, message, context);
    }

    error(message: string, context?: { [key: string]: any }) {
        this.log(BrowserLogger.Level.ERROR, message, context);
    }
}
