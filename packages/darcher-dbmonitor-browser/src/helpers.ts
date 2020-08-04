enum LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR,
}

class logger {
    private readonly printLevel: LogLevel;

    private static lvl2String(level: LogLevel): string {
        switch (level) {
            case LogLevel.ERROR:
                return "ERROR";
            case LogLevel.DEBUG:
                return "DEBUG";
            case LogLevel.INFO:
                return "INFO";
            case LogLevel.WARN:
                return "WARN";
        }
    }

    constructor(level: LogLevel) {
        this.printLevel = level;
    }

    public log(level: LogLevel, ...msgs: any[]): void {
        if (level < this.printLevel) {
            return
        }
        let now = new Date();
        console.log(`[${logger.lvl2String(level)}] [${now.toLocaleDateString()} ${now.toLocaleTimeString()}]`, ...msgs);
    }

    public info(...msgs: any[]) {
        this.log(LogLevel.INFO, ...msgs);
    }

    public warn(...msgs: any[]) {
        this.log(LogLevel.WARN, ...msgs);
    }

    public debug(...msgs: any[]) {
        this.log(LogLevel.DEBUG, ...msgs);
    }

    public error(...msgs: any[]) {
        this.log(LogLevel.ERROR, ...msgs);
    }
}

export const Logger = new logger(LogLevel.DEBUG);

export function getDomainAndPort(url: string): string {
    let arr = url.split("/");
    return arr[2];
}