"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@darcher/helpers");
var WebSocket = require("ws");
var fs = require("fs");
var path = require("path");
var TraceStore = /** @class */ (function () {
    function TraceStore(port, logger, save_dir, callback) {
        this.port = port;
        this.logger = logger;
        this.save_dir = save_dir;
        this.callback = callback;
        if (!this.logger) {
            this.logger = new helpers_1.Logger("TraceStore", 'info');
        }
    }
    TraceStore.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!fs.existsSync(this.save_dir)) {
                    fs.mkdirSync(this.save_dir, { recursive: true });
                }
                this.logger.info("Transaction trace will be saved in " + this.save_dir);
                this.wss = new WebSocket.Server({ port: this.port });
                this.wss.on("connection", function (ws) {
                    _this.logger.debug("Websocket connection with trace store opened");
                    ws.on("message", function (message) {
                        var msg = JSON.parse(message);
                        if (_this.save_dir) {
                            fs.writeFileSync(path.join(_this.save_dir, msg.hash + ".json"), JSON.stringify(msg, null, 2));
                        }
                        if (_this.callback) {
                            _this.callback(msg);
                        }
                        _this.logger.info("Save transaction trace", { tx: helpers_1.prettifyHash(msg.hash) });
                        // notify client the transaction has been received
                        ws.send("");
                    });
                    ws.on("close", function () {
                        _this.logger.debug("Websocket connection with trace store closed");
                    });
                });
                this.wss.on("error", function (error) {
                    _this.logger.error(new helpers_1.WebsocketError(error));
                });
                this.logger.info("Trace store started via WebSocket at port " + this.port);
                return [2 /*return*/];
            });
        });
    };
    TraceStore.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (!_this.wss) {
                            _this.logger.info("Trace store already shutdown");
                            resolve();
                            return;
                        }
                        _this.wss.close(function (err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                _this.logger.info("Trace store shutdown");
                                resolve();
                            }
                        });
                    })];
            });
        });
    };
    return TraceStore;
}());
exports.default = TraceStore;
if (require.main === module) {
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var store;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    store = new TraceStore(1236, undefined, path.join(__dirname, "data"));
                    return [4 /*yield*/, store.start()];
                case 1:
                    _a.sent();
                    process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, store.shutdown()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); })();
}
//# sourceMappingURL=store.js.map