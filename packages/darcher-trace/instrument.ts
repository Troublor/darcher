export interface SendTransactionTrace {
    hash: string,
    trace: string,
}

export function traceSendAsync(payload: { method: string }, callback: Function): [{ method: string }, Function] {
    if (!payload || typeof payload !== "object") {
        return [payload, callback];
    }
    if (payload.hasOwnProperty('method') && (payload['method'] === 'eth_sendTransaction' || payload['method'] === 'eth_sendRawTransaction')) {
        const traceObj = {stack: undefined};
        Error.captureStackTrace(traceObj, traceSendAsync);
        callback = new Proxy(callback, {
            apply(target, thisArg, argArray) {
                const trace = {
                    hash: argArray[1],
                    trace: traceObj.stack,
                }
                console.log(trace)
                const ws = new WebSocket(`ws://localhost:1236`);
                ws.onopen = () => {
                    ws.send(JSON.stringify(trace));
                };
                ws.onerror = (ev: ErrorEvent) => {
                    console.error("Send transaction trace error", ev);
                }
                ws.onmessage = () => {
                    ws.close();
                }
                target.apply(thisArg, argArray);
            },
        });
    }
    return [payload, callback];
}
