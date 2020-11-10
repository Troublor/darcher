"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceSendAsync = void 0;
function traceSendAsync(payload, callback) {
    if (!payload || typeof payload !== "object") {
        return [payload, callback];
    }
    if (payload.hasOwnProperty('method') && (payload['method'] === 'eth_sendTransaction' || payload['method'] === 'eth_sendRawTransaction')) {
        var traceObj_1 = { stack: undefined };
        Error.captureStackTrace(traceObj_1, traceSendAsync);
        callback = new Proxy(callback, {
            apply: function (target, thisArg, argArray) {
                var trace = {
                    hash: argArray[1],
                    trace: traceObj_1.stack,
                };
                console.log(trace);
                var ws = new WebSocket("ws://localhost:1236");
                ws.onopen = function () {
                    ws.send(JSON.stringify(trace));
                };
                ws.onerror = function (ev) {
                    console.error("Send transaction trace error", ev);
                };
                ws.onmessage = function () {
                    ws.close();
                };
                target.apply(thisArg, argArray);
            },
        });
    }
    return [payload, callback];
}
exports.traceSendAsync = traceSendAsync;
//# sourceMappingURL=instrument.js.map