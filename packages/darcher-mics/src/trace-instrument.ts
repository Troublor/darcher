import {Logger, prettifyHash} from "@darcher/helpers-browser";

export interface SendTransactionTrace {
    hash: string,
    stack: string[],
}

const logger = new Logger("Trace", Logger.Level.INFO);

export function traceSendAsync(method: string, callback: Function): Function {
    if ((method === 'eth_sendTransaction' || method === 'eth_sendRawTransaction')) {
        const traceObj = {stack: undefined};
        Error.captureStackTrace(traceObj, traceSendAsync);
        callback = new Proxy(callback, {
            apply(target, thisArg, argArray) {
                const trace = {
                    hash: argArray[1],
                    stack: traceObj.stack.split(/\n/).map(item => item.trim()).filter(item => item.length > 0 && item !== "Error"),
                } as SendTransactionTrace;
                logger.info("Transaction trace", {hash: prettifyHash(trace.hash), stack: trace.stack})
                const ws = new WebSocket(`ws://localhost:1236`);
                ws.onopen = () => {
                    ws.send(JSON.stringify(trace));
                };
                ws.onerror = (ev: ErrorEvent) => {
                    logger.error("Send transaction trace error", {err: ev});
                }
                ws.onmessage = () => {
                    ws.close();
                }
                target.apply(thisArg, argArray);
            },
        });
    }
    return callback;
}

export function traceSend(method: string, result: string) {
    if ((method === 'eth_sendTransaction' || method === 'eth_sendRawTransaction')) {
        const traceObj = {stack: undefined};
        Error.captureStackTrace(traceObj, traceSendAsync);
        const trace = {
            hash: result,
            stack: traceObj.stack.split(/\n/).map(item => item.trim()).filter(item => item.length > 0 && item !== "Error"),
        } as SendTransactionTrace;
        logger.info("Transaction trace", {hash: prettifyHash(trace.hash), stack: trace.stack});
        const ws = new WebSocket(`ws://localhost:1236`);
        ws.onopen = () => {
            ws.send(JSON.stringify(trace));
        };
        ws.onerror = (ev: ErrorEvent) => {
            logger.error("Send transaction trace error", {err: ev});
        }
        ws.onmessage = () => {
            ws.close();
        }
    }
}
