import BaseHook from "./BaseHook";
import {CRUDOperation, DAppStateChangeMsg, LifecycleState, Reply} from "../../dArcher/common";
import Context from "../Context";
import {Application, HookContext, Service} from "@feathersjs/feathers";
import {INSTRU_SUFFIX} from "../common";
import dArcherNotifier from "../../dArcher";
import {Recognizer} from "./Web3CallbackHook";

class WholeDatabaseHook extends BaseHook {
    private static readonly processTimeout: number = 500 // in millisecond
    private static readonly confirmationsCount = 1;
    private globalHookAdded = false;
    private currentTxState: LifecycleState = null;
    private currentTxHash: string = null;

    private cleanResultCache: object = null;

    beforeCallF(context: Context, fn: Function, args: any[]): [Function, any[]] {
        return super.beforeCallF(context, fn, args);
    }

    beforeCallM(context: Context, obj: object, prop: any, args: any[]): [object, any, any[]] {
        if (this.currentTxState == null || this.currentTxHash == null) {
            // if currentTxState is null, then current function call is not a consequence of web3 event
            return super.beforeCallM(context, obj, prop, args);
        }
        // insert a after hook in the first place
        if (WholeDatabaseHook.isFeathersService(obj) && prop === "hook") {
            if (args.length > 0 && typeof args[0] === 'object' && args[0]['after'] !== undefined) {
                let afterHooks = args[0]['after'];
                if (afterHooks !== null) {
                    let getCleanResultHook = async (context: HookContext) => {
                        this.cleanResultCache = context.result;
                    }
                    if (typeof afterHooks === "function") {
                        args[0]['after'] = [getCleanResultHook, afterHooks];
                    } else if (Array.isArray(afterHooks)) {
                        afterHooks.unshift(getCleanResultHook);
                    } else if (typeof afterHooks === 'object') {
                        if (afterHooks['all'] === undefined || afterHooks['all'] === null) {
                            afterHooks['all'] = [getCleanResultHook];
                        } else if (Array.isArray(afterHooks['all'])) {
                            afterHooks['all'].unshift(getCleanResultHook);
                        }
                    }
                }
            }
            return super.beforeCallM(context, obj, prop, args);
        }
        // check if obj is feathers-js app(
        if (!this.globalHookAdded && WholeDatabaseHook.isFeathersApp(obj)) {
            let app: Application = <Application>obj;
            if (app.hooks !== undefined) {
                try {
                    // add feathers app hooks
                    app.hooks({
                        before: [
                            // before hook to get the data entry before update/patch
                            async (context) => {
                                switch (context.method) {
                                    case "update":
                                    case "patch":
                                    case "remove":
                                        console.log("update/patch event, try to fetch From: ", context.service.toString(), context.id, context.params);
                                        if (context.id !== null && context.id !== undefined) {
                                            // @ts-ignore
                                            context[INSTRU_SUFFIX + "from"] = await context.service.get(context.id, context.params);
                                            if (this.cleanResultCache !== null) {
                                                // @ts-ignore
                                                context[INSTRU_SUFFIX + "from"] = this.cleanResultCache;
                                                this.cleanResultCache = null;
                                            }
                                        } else {
                                            // @ts-ignore
                                            context[INSTRU_SUFFIX + "from"] = await context.service.find(context.params);
                                            if (this.cleanResultCache !== null) {
                                                // @ts-ignore
                                                context[INSTRU_SUFFIX + "from"] = this.cleanResultCache;
                                                this.cleanResultCache = null;
                                            }
                                        }
                                        break;
                                }
                            },
                        ],
                        after: []
                    });
                    this.globalHookAdded = true;
                } catch (e) {
                    this.globalHookAdded = false;
                }
            }

        }
        if (WholeDatabaseHook.isFeathersService(obj)) {
            let txState = this.currentTxState;
            let txHash = this.currentTxHash;
            let service = <Service<any>>obj;
            switch (prop) {
                case "create":
                    service.once("created", async (data, ctx: HookContext) => {
                        console.log("created event");
                        dArcherNotifier.notifyDAppStateChange(
                            WholeDatabaseHook.genDAppStateMsg(
                                txState, txHash, WholeDatabaseHook.getFeathersServiceName(ctx), null, data, CRUDOperation.CREATE
                            ),
                            (err: any, resp: Reply) => {
                                if (resp.Err !== null) {
                                    console.error(resp.Err);
                                }
                            }
                        );
                    });
                    break;
                case "remove":
                    service.once("removed", async (data, ctx: HookContext) => {
                        console.log("removed event");
                        let from = null;
                        if (ctx !== undefined) {
                            // @ts-ignore
                            from = ctx[INSTRU_SUFFIX + "from"];
                        } else {
                            from = data;
                        }
                        dArcherNotifier.notifyDAppStateChange(
                            WholeDatabaseHook.genDAppStateMsg(
                                txState, txHash, WholeDatabaseHook.getFeathersServiceName(ctx), from, null, CRUDOperation.DELETE
                            ),
                            (err: any, resp: Reply) => {
                                if (resp.Err !== null) {
                                    console.error(resp.Err);
                                }
                            });
                    });
                    break;
                case "patch":
                    service.once("patched", async (data, ctx: HookContext) => {
                        console.log("patched event");
                        // @ts-ignore
                        let from = ctx[INSTRU_SUFFIX + "from"];
                        let to = null;
                        if (ctx === undefined) {
                            to = data;
                        } else if (ctx.id !== null && ctx.id !== undefined) {
                            to = await ctx.service.get(ctx.id, ctx.params);
                            if (this.cleanResultCache !== null) {
                                // @ts-ignore
                                to = this.cleanResultCache;
                                this.cleanResultCache = null;
                            }
                        } else {
                            to = await ctx.service.find(ctx.params);
                            if (this.cleanResultCache !== null) {
                                // @ts-ignore
                                to = this.cleanResultCache;
                                this.cleanResultCache = null;
                            }
                        }
                        dArcherNotifier.notifyDAppStateChange(
                            WholeDatabaseHook.genDAppStateMsg(
                                txState, txHash, WholeDatabaseHook.getFeathersServiceName(ctx), from, to, CRUDOperation.UPDATE
                            ),
                            (err: any, resp: Reply) => {
                                if (resp.Err !== null) {
                                    console.error(resp.Err);
                                }
                            });
                    });
                    break;
                case "update":
                    service.once("updated", async (data, ctx: HookContext) => {
                        console.log("updated event");
                        // @ts-ignore
                        let from = ctx[INSTRU_SUFFIX + "from"];
                        let to = null;
                        if (ctx === undefined) {
                            to = data;
                        } else if (ctx.id !== null) {
                            to = await ctx.service.get(ctx.id, ctx.params);
                            if (this.cleanResultCache !== null) {
                                // @ts-ignore
                                to = this.cleanResultCache;
                                this.cleanResultCache = null;
                            }
                        } else {
                            to = await ctx.service.find(ctx.params);
                            if (this.cleanResultCache !== null) {
                                // @ts-ignore
                                to = this.cleanResultCache;
                                this.cleanResultCache = null;
                            }
                        }
                        dArcherNotifier.notifyDAppStateChange(
                            WholeDatabaseHook.genDAppStateMsg(
                                txState, txHash, WholeDatabaseHook.getFeathersServiceName(ctx), from, to, CRUDOperation.UPDATE
                            ),
                            (err: any, resp: Reply) => {
                                if (resp.Err !== null) {
                                    console.error(resp.Err);
                                }
                            });
                    });
                    break;
            }
        }
        return super.beforeCallM(context, obj, prop, args);
    }

    /**
     * before starting executing the function body, check the arguments to see if this is a blockchain interaction callback
     * @param context
     * @param args
     * @param argList
     */
    onStartFn(context: Context, args: any[], argList: IArguments): void {
        if (this.currentTxState != null || this.currentTxHash != null) {
            // if currentTxState is not null, then currently another web3 event is being processed
            return super.onStartFn(context, args, argList);
        }
        // before calling this function, check the arguments
        Recognizer.checkTxHashCallback(argList, txHash => {
            console.log(context.fn, "got txHash callback:", txHash);
            this.currentTxHash = txHash;
            this.currentTxState = LifecycleState.PENDING;
            this.setProcessTimeout();
        });
        Recognizer.checkConfirmationCallback(argList, (confirmationNumber, receipt) => {
            // @ts-ignore
            console.log(context.fn, "got confirmation callback:", confirmationNumber, receipt["transactionHash"]);
            // @ts-ignore
            this.currentTxHash = receipt["transactionHash"];
            this.currentTxState = confirmationNumber >= WholeDatabaseHook.confirmationsCount ? LifecycleState.CONFIRMED : LifecycleState.EXECUTED;
            this.setProcessTimeout();
        });
        Recognizer.checkReceiptCallback(argList, receipt => {
            // @ts-ignore
            console.log(context.fn, "got receipt callback:", receipt["transactionHash"]);
            // @ts-ignore
            this.currentTxHash = receipt["transactionHash"];
            this.currentTxState = LifecycleState.EXECUTED;
            this.setProcessTimeout();
        });
        Recognizer.checkEventDataCallback(argList, event => {
            // @ts-ignore
            console.log(context.fn, "got event data callback:", event["transactionHash"]);
            // @ts-ignore
            this.currentTxHash = event["transactionHash"];
            this.currentTxState = LifecycleState.EXECUTED;
            this.setProcessTimeout();
        });
        Recognizer.checkEventChangedCallback(argList, event => {
            // @ts-ignore
            console.log(context.fn, "got event changed callback:", event["transactionHash"]);
            // @ts-ignore
            this.currentTxHash = event["transactionHash"];
            // @ts-ignore
            this.currentTxState = event["removed"] === true ? LifecycleState.REVERTED : LifecycleState.EXECUTED;
            this.setProcessTimeout();
        });
    }

    private setProcessTimeout() {
        let self = this;
        setTimeout(function () {
            self.currentTxState = null;
            self.currentTxHash = null;
        }, WholeDatabaseHook.processTimeout);
    }

    private static getFeathersServiceName(context: HookContext): string {
        if (context === undefined) {
            return null;
        }
        let app = context.app;
        let service = context.service;
        // @ts-ignore
        for (let name in app.services) {
            // @ts-ignore
            if (app.services[name] == service) {
                return name;
            }
        }
        return null;
    }

    private static isFeathersService(obj: object): boolean {
        // @ts-ignore
        return obj.hasOwnProperty("hooks") && typeof obj["hooks"] == "function";
    }

    private static isFeathersApp(obj: object): boolean {
        // @ts-ignore
        return obj.hasOwnProperty("use") && typeof obj["use"] == "function" &&
            // @ts-ignore
            obj.hasOwnProperty("service") && typeof obj["service"] == "function";

    }

    private static genDAppStateMsg(txState: LifecycleState, txHash: string, table: string, from: object, to: object, operation: CRUDOperation): DAppStateChangeMsg {
        return <DAppStateChangeMsg>{
            TxHash: txHash,
            TxState: txState,
            Table: table,
            From: from,
            To: to,
            Timestamp: Date.now(),
            Operation: operation
        }
    }
}