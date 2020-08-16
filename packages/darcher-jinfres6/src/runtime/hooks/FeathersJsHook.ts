import Web3CallbackHook, {FnMetadata, FnMetadataType, Metadata, MetadataType} from "./Web3CallbackHook";
import Context from "../Context";
import {Application, Service} from "@feathersjs/feathers";
import {INSTRU_SUFFIX} from "../common";
import {CRUDOperation, DAppStateChangeMsg, LifecycleState, Reply} from "../../dArcher/common";
import dArcherNotifier from "../../dArcher";

export default class FeathersJsHook extends Web3CallbackHook {
    private globalHookAdded = false;
    private dbEntryTracker = new DatabaseEntryTracker();

    beforeCallF(context: Context, fn: Function, args: any[]): [Function, any[]] {
        return super.beforeCallF(context, fn, args);
    }

    beforeCallM(context: Context, obj: object, prop: any, args: any[]): [object, any, any[]] {
        // check if obj is feathers-js app
        if (!this.globalHookAdded && FeathersJsHook.isFeathersApp(obj)) {
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
                                        console.log("update/patch event, try to fetch From: ", context.service.toString(), context.id, context.params);
                                        if (context.id !== null) {
                                            // @ts-ignore
                                            context[INSTRU_SUFFIX + "from"] = await context.service.get(context.id, context.params);
                                        } else {
                                            // @ts-ignore
                                            context[INSTRU_SUFFIX + "from"] = await context.service.find(context.params);
                                        }
                                        break;
                                }
                            },
                        ],
                        after: [

                        ]
                    });
                    this.globalHookAdded = true;
                } catch (e) {
                    this.globalHookAdded = false;
                }
            }

        }
        if (FnMetadata.has(context.fn) && FeathersJsHook.isFeathersService(obj)) {
            let service = <Service<any>>obj;
            switch (prop) {
                case "create":
                    service.once("created", function (data, ctx) {
                        console.log("created event");
                        dArcherNotifier.notifyDAppStateChange(FeathersJsHook.genDAppStateMsg(context.fn, null, data, CRUDOperation.CREATE),
                            (err: any, resp: Reply) => {
                                if (resp.Err !== null) {
                                    console.error(resp.Err);
                                }
                            });
                    });
                    break;
                case "remove":
                    service.once("removed", function (data, ctx) {
                        console.log("removed event");
                        dArcherNotifier.notifyDAppStateChange(FeathersJsHook.genDAppStateMsg(context.fn, data, null, CRUDOperation.DELETE),
                            (err: any, resp: Reply) => {
                                if (resp.Err !== null) {
                                    console.error(resp.Err);
                                }
                            });
                    });
                    break;
                case "patch":
                    service.once("patched", function (data, ctx) {
                        console.log("patched event");
                        let from = ctx[INSTRU_SUFFIX + "from"];
                        dArcherNotifier.notifyDAppStateChange(FeathersJsHook.genDAppStateMsg(context.fn, from, data, CRUDOperation.UPDATE),
                            (err: any, resp: Reply) => {
                                if (resp.Err !== null) {
                                    console.error(resp.Err);
                                }
                            });
                    });
                    break;
                case "update":
                    service.once("updated", function (data, ctx) {
                        console.log("updated event");
                        let from = ctx[INSTRU_SUFFIX + "from"];
                        dArcherNotifier.notifyDAppStateChange(FeathersJsHook.genDAppStateMsg(context.fn, from, data, CRUDOperation.UPDATE),
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

    private static genDAppStateMsg(fn: Function, from: object, to: object, operation: CRUDOperation): DAppStateChangeMsg {
        let txHash = Web3CallbackHook.getTxHash(FnMetadata.get(fn));
        let txState;
        switch (FnMetadata.get<FnMetadata>(fn).fnType) {
            case FnMetadataType.TxHashCallback:
                txState = LifecycleState.CREATED;
                break;
            case FnMetadataType.TxReceiptCallback:
            case FnMetadataType.EventDataCallback:
                txState = LifecycleState.EXECUTED;
                break;
            case FnMetadataType.EventChangeCallback:
                // TODO have a problem here: event change callback may not mean reverted transaction
                txState = LifecycleState.REVERTED;
                break;
            case FnMetadataType.TxConfirmationCallback:
                // TODO have a problem here: confirmation callback may not mean confirmed transaction
                txState = LifecycleState.CONFIRMED
                break;
        }
        return <DAppStateChangeMsg>{
            TxHash: txHash,
            TxState: txState,
            From: from,
            To: to,
            Timestamp: Date.now(),
            Operation: operation
        }
    }
}

class DatabaseEntryTracker {
    private readonly entryMetadataMapping: { [id: string]: DfMetadata }

    constructor() {
        this.entryMetadataMapping = {}
    }

    public get(id: string): DfMetadata {
        return this.entryMetadataMapping[id];
    }

    public update(id: string, metadata: DfMetadata): void {
        this.entryMetadataMapping[id] = metadata;
    }
}

/**
 * Data flow metadata
 */
class DfMetadata extends Metadata {
    constructor() {
        super(MetadataType.Dataflow);
    }
}