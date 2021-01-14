import {Logger, prettifyHash} from "@darcher/helpers-browser";
import {Data} from "./metamask-notifier";

export interface SendTransactionTrace {
    hash: string,
    stack: string[],
}

export interface StackTraceMessage extends Data {
    type: "FetchStackTrace",
    stack: string[],
}

const logger = new Logger("Trace", Logger.Level.INFO);

async function oneTimeWebSocketRequest<T extends Data>(url: string, data: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const ws = new WebSocket(url);
        ws.onopen = () => {
            // send request
            ws.send(JSON.stringify(data));
        };
        ws.onerror = (ev: ErrorEvent) => {
            reject(ev);
        };
        ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data) as T;
            resolve(msg);
            ws.close();
        };
    });
}

export async function getStackTraceByCrawljax(): Promise<string[]> {
    const resp = await oneTimeWebSocketRequest("ws://localhost:1237", {
        type: "FetchStackTrace",
        stack: [],
    } as StackTraceMessage);
    return resp.stack;
}

export interface TraceHistory {
    method: string,
    params: any[],
    stack: string[] | null,
}

declare global {
    interface Window {
        traceHistories: TraceHistory[];
    }
}

let isBrowser;
let GLOBAL;
if (typeof window !== "undefined") {
    GLOBAL = window;
    isBrowser = true;
} else if (typeof global !== "undefined") {
    GLOBAL = global;
    isBrowser = false;
} else {
    throw new Error("Failed to load trace-instrument");
}

if (typeof GLOBAL !== "undefined" && !GLOBAL.traceHistories) {
    GLOBAL.traceHistories = [] as TraceHistory[];
}


// eslint-disable-next-line @typescript-eslint/ban-types
export function traceSendAsync(method: string, params: any[], callback: Function): Function {
    const traceCache: TraceHistory = {
        method: method,
        params: params,
        stack: null,
    };
    if (["eth_sendTransaction", "eth_sendRawTransaction", "eth_estimateGas"].includes(method)) {
        const traceObj = {stack: undefined};
        Error.captureStackTrace(traceObj, traceSendAsync);
        callback = new Proxy(callback, {
            apply(target, thisArg, argArray) {
                if (method === "eth_estimateGas") {
                    // save gas
                    traceCache.params[0].gas = argArray[1];
                    // save to history, in case there is a transaction use this call later
                    traceCache.stack = traceObj.stack.split(/\n/).map(item => item.trim()).filter(item => item.length > 0 && item !== "Error");
                    GLOBAL.traceHistories.push(traceCache);
                } else if (["eth_sendTransaction", "eth_sendRawTransaction"].includes(method)) {
                    // search trace history for a possible estimateGas cache (which is more precise)
                    for (let i = GLOBAL.traceHistories.length - 1; i >= 0; i--) {
                        const history = GLOBAL.traceHistories[i];
                        if (history.method === "eth_estimateGas" &&
                            history.params[0] && params[0] &&
                            history.params[0].from === params[0].from &&
                            history.params[0].to === params[0].to &&
                            history.params[0].data === params[0].data
                        ) {
                            // delete this from history
                            GLOBAL.traceHistories = GLOBAL.traceHistories.filter(value => value !== history);
                            // use the stack trace of this cache
                            traceCache.stack = history.stack;
                            break;
                        }
                    }
                    if (!traceCache.stack) {
                        // no history found, use current one
                        traceCache.stack = traceObj.stack.split(/\n/).map(item => item.trim()).filter(item => item.length > 0 && item !== "Error");
                    }
                    // send trace to server
                    const trace = {
                        hash: typeof argArray[1] === "string" ? argArray[1] : argArray[1].result,
                        stack: traceCache.stack,
                    } as SendTransactionTrace;
                    logger.info("Transaction trace", {hash: trace.hash, stack: trace.stack});
                    if (isBrowser) {
                        const ws = new WebSocket("ws://localhost:1236");
                        ws.onopen = () => {
                            ws.send(JSON.stringify(trace));
                        };
                        ws.onerror = (ev: ErrorEvent) => {
                            logger.error("Send transaction trace error", {err: ev});
                        };
                        ws.onmessage = () => {
                            ws.close();
                        };
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        const WebSocket = require("ws");
                        const ws = new WebSocket("ws://localhost:1236");
                        ws.on("open", () => {
                            ws.send(JSON.stringify(trace));
                        });
                        ws.on("error", e => {
                            logger.error("Send transaction trace error", {err: e});
                        });
                        ws.on("message", () => {
                            ws.close();
                        });
                    }

                }
                target.apply(thisArg, argArray);
            },
        });
    }
    return callback;
}

export function traceSend(method: string, result: string) {
    if ((method === "eth_sendTransaction" || method === "eth_sendRawTransaction")) {
        const traceObj = {stack: undefined};
        Error.captureStackTrace(traceObj, traceSendAsync);
        const trace = {
            hash: result,
            stack: traceObj.stack.split(/\n/).map(item => item.trim()).filter(item => item.length > 0 && item !== "Error"),
        } as SendTransactionTrace;
        logger.info("Transaction trace", {hash: prettifyHash(trace.hash), stack: trace.stack});
        const ws = new WebSocket("ws://localhost:1236");
        ws.onopen = () => {
            ws.send(JSON.stringify(trace));
        };
        ws.onerror = (ev: ErrorEvent) => {
            logger.error("Send transaction trace error", {err: ev});
        };
        ws.onmessage = () => {
            ws.close();
        };
    }
}
