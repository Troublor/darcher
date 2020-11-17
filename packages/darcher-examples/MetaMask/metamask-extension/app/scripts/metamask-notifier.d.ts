export interface Data {
    type: string;
}
export interface NewTransaction extends Data {
    type: "NewTransaction";
    from: string;
    to: string;
    gas: string;
    gasPrice: string;
    value: string;
    hash?: string;
}
export default class MetaMaskNotifier {
    private readonly address;
    private ws;
    private logger;
    constructor(address: string);
    start(): void;
    onMessage(payload: string): void;
    onError(err: any): void;
    onClose(): void;
    notifyUnapprovedTx(data: NewTransaction): void;
    notifyUnlockRequest(data: Data): void;
}
export declare class Logger {
    private readonly level;
    private readonly module?;
    static LevelVerbose: number;
    static LevelDebug: number;
    static LevelInfo: number;
    static LevelWarn: number;
    static LevelError: number;
    constructor(level: number, module?: string);
    log(level: any, ...messages: any[]): void;
    info(...messages: any[]): void;
    warn(...messages: any[]): void;
    debug(...messages: any[]): void;
    error(...messages: any[]): void;
    verbose(...messages: any[]): void;
}
