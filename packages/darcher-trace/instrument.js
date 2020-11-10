"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceSend = exports.traceSendAsync = void 0;
function traceSendAsync(method, callback) {
    if ((method === 'eth_sendTransaction' || method === 'eth_sendRawTransaction')) {
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
    return callback;
}
exports.traceSendAsync = traceSendAsync;
function traceSend(method, result) {
    if ((method === 'eth_sendTransaction' || method === 'eth_sendRawTransaction')) {
        var traceObj = { stack: undefined };
        Error.captureStackTrace(traceObj, traceSendAsync);
        var trace_1 = {
            hash: result,
            trace: traceObj.stack,
        };
        console.log(trace_1);
        var ws_1 = new WebSocket("ws://localhost:1236");
        ws_1.onopen = function () {
            ws_1.send(JSON.stringify(trace_1));
        };
        ws_1.onerror = function (ev) {
            console.error("Send transaction trace error", ev);
        };
        ws_1.onmessage = function () {
            ws_1.close();
        };
    }
}
exports.traceSend = traceSend;
//# sourceMappingURL=instrument.js.map