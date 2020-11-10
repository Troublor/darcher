export interface SendTransactionTrace {
    hash: string,
    trace: string,
}

export function traceSendAsync(method: string, callback: Function): Function {
    if ((method === 'eth_sendTransaction' || method === 'eth_sendRawTransaction')) {
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
    return callback;
}

export function traceSend(method: string, result: string) {
    if ((method === 'eth_sendTransaction' || method === 'eth_sendRawTransaction')) {
        const traceObj = {stack: undefined};
        Error.captureStackTrace(traceObj, traceSendAsync);
        const trace = {
            hash: result,
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
    }
}
