import BaseHook from "./BaseHook";
import Context from "../Context";
import {INSTRU_SUFFIX} from "../common";
import {retriever} from "../dappstate";

/**
 * This CallbackHook is meant to find blockchain interaction callback functions
 *
 * if any function object is attached a FnMetadata before it is called, the FnMetadata should be removed by the end of the function
 */
export default class Web3CallbackHook extends BaseHook {
    beforeCallF(context: Context, fn: Function, args: any[]): [Function, any[]] {
        if (context.fn !== null && FnMetadata.has(context.fn)) {
            // if the function context of the calling, is already have a fnMetadata,
            // inherit the FnMetadata to the being called function
            let parentMetadata = Metadata.get<FnMetadata>(context.fn);
            Metadata.attach(fn, parentMetadata.inherit(fn));

            // if any argument is a function object, also attach inherited Metadata to it
            // this is because the callback function in blockchain interaction callback body is also need to be monitored
            for (let arg of args) {
                if (typeof arg === "function") {
                    Metadata.attach(arg, parentMetadata.inherit(fn));
                }
            }
        }
        return [fn, args];
    }

    beforeCallM(context: Context, obj: object, prop: any, args: any[]): [object, any, any[]] {
        if (context.fn !== null && FnMetadata.has(context.fn)) {
            // if the function context of the calling, is already have a fnMetadata,
            // inherit the FnMetadata to the being called function
            let parentMetadata = Metadata.get<FnMetadata>(context.fn);
            // @ts-ignore
            Metadata.attach(obj[prop], parentMetadata.inherit(obj[prop]));

            // if any argument is a function object, also attach inherited Metadata to it
            // this is because the callback function in blockchain interaction callback body is also need to be monitored
            for (let arg of args) {
                if (typeof arg === "function") {
                    Metadata.attach(arg, parentMetadata.inherit(arg));
                }
            }
        }
        return [obj, prop, args];
    }

    /**
     * before starting executing the function body, check the arguments to see if this is a blockchain interaction callback
     * @param context
     * @param args
     * @param argList
     */
    onStartFn(context: Context, args: any[], argList: IArguments): void {
        if (context.fn === null) {
            return;
        }
        // if the context is already in a function that has Metadata, then do not check arguments anymore
        if (Metadata.has(context.fn)) {
            return;
        }
        // before calling this function, check the arguments
        Recognizer.checkTxHashCallback(argList, txHash => {
            console.log("got txHash callback:", txHash);
            Metadata.attach(context.fn, new TxHashCallbackMetadata(null, txHash));
        });
        Recognizer.checkConfirmationCallback(argList, (confirmationNumber, receipt) => {
            // @ts-ignore
            console.log("got confirmation callback:", confirmationNumber, receipt["transactionHash"]);
            Metadata.attach(context.fn, new TxConfirmationCallbackMetadata(null, confirmationNumber, <Receipt>receipt));
        });
        Recognizer.checkReceiptCallback(argList, receipt => {
            // @ts-ignore
            console.log("got receipt callback:", receipt["transactionHash"]);
            Metadata.attach(context.fn, new TxReceiptCallbackMetadata(null, <Receipt>receipt));
        });
        Recognizer.checkEventDataCallback(argList, event => {
            // @ts-ignore
            console.log("got event data callback:", event["transactionHash"]);
            Metadata.attach(context.fn, new EventDataCallbackMetadata(null, <Event>event));
        });
        Recognizer.checkEventChangedCallback(argList, event => {
            // @ts-ignore
            console.log("got event changed callback:", event["transactionHash"]);
            Metadata.attach(context.fn, new EventChangedCallbackMetadata(null, <Event>event));
        });
    }

    onFinishFn(context: Context): void {
        if (context.fn !== null) {
            if (FnMetadata.has(context.fn)) {
                // just print some debug message here
                let metadata = Metadata.get<FnMetadata>(context.fn);
                if (metadata.parentFn === null) {
                    console.log("callback finishes:", metadata.fnType);
                    if (retriever != null) {
                        console.log("dapp state: ", retriever.getState());
                    }
                }
                // remove the FnMetadata from the function object at the end of the function execution
                // Note that there may be async function in the body which hasn't be executed yet by the end of current function
                // that's totally fine because the async function object also has the FnMetadata (the same object, not a copy)
                // Metadata.remove(context.fn);
            }
        }
        return;
    }


    public static getTxHash(metadata: FnMetadata): string {
        switch (metadata.fnType) {
            case FnMetadataType.TxHashCallback:
                return (<TxHashCallbackMetadata>metadata).txHash;
            case FnMetadataType.TxReceiptCallback:
                return (<TxReceiptCallbackMetadata>metadata).receipt.transactionHash;
            case FnMetadataType.TxConfirmationCallback:
                return (<TxConfirmationCallbackMetadata>metadata).receipt.transactionHash;
            case FnMetadataType.EventDataCallback:
                return (<EventDataCallbackMetadata>metadata).event.transactionHash;
            case FnMetadataType.EventChangeCallback:
                return (<EventChangedCallbackMetadata>metadata).event.transactionHash;
            default:
                return null;
        }
    }
};

export enum MetadataType {
    Fn,
    Dataflow
}

/**
 * this is the base Metadata class for all types of Metadata (e.g. FnMetadata)
 */
export class Metadata {
    public static KEY = "Metadata" + INSTRU_SUFFIX;

    public readonly type: MetadataType;

    /**
     * return true if obj has Metadata and the type is the same as given
     * if type is not specified, do not check type
     * @param obj
     * @param type?
     */
    public static has(obj: object, type?: MetadataType): boolean {
        if (obj.hasOwnProperty(Metadata.KEY)) {
            // @ts-ignore
            if (obj[Metadata.KEY] === undefined) {
                return false;
            }
            if (type === undefined) {
                return false;
            }
            // @ts-ignore
            if (obj[Metadata.KEY].type === type) {
                return true;
            }
        }
        return false;
    }

    /**
     * attach a Metadata to the object
     * @param obj
     * @param metadata
     * @return object: the object with metadata attached
     */
    public static attach(obj: object, metadata: Metadata): object {
        if (obj === null || obj === undefined) {
            throw new Error("cannot attach metadata to null or undefined");
        }
        if (metadata == undefined) {
            console.error("attach an undefined metadata to obj:", obj)
        }
        // @ts-ignore
        obj[Metadata.KEY] = metadata;
        return obj;
    }

    /**
     * get the attached Metadata object of the provided object
     * if it doesn't exist, undefined will be returned
     * @template T: the type of Metadata (subclass)
     * @param obj
     * @return metadata
     */
    public static get<T extends Metadata>(obj: object): T {
        // @ts-ignore
        let metadata = obj[Metadata.KEY];
        if (metadata === undefined) {
            return undefined;
        }
        return <T>metadata;
    }

    /**
     * remove the attached Metadata of the object
     * @param obj
     */
    public static remove(obj: object) {
        // @ts-ignore
        // delete obj[Metadata.KEY];
    }

    constructor(type: MetadataType) {
        this.type = type;
    }

    /**
     * copy the metadata object
     */
    public copy(): Metadata {
        return new Metadata(this.type);
    }
}

export enum FnMetadataType {
    NA = "N/A", // NA means not-applicable, showing the function is not a blockchain interaction callback
    Inherit = 'Inherit', // Inherit means this function is not original callback, rather it is called by original callback
    TxHashCallback = "TxHashCallback",
    TxConfirmationCallback = "TxConfirmationCallback",
    TxReceiptCallback = "TxConfirmationCallback",
    EventDataCallback = "EventDataCallback",
    EventChangeCallback = "EventChangedCallback",
}

/**
 * FnMetadata is attached to function object
 */
export class FnMetadata extends Metadata {
    public readonly parentFn: Function; // this field points to the parent function object of current function

    public readonly fnType: FnMetadataType; // this field points out what kind of callback it is

    /**
     * return true if fn object is a function and has FnMetadata
     * @param fn
     */
    public static has(fn: object): boolean {
        if (typeof fn !== "function") {
            return false;
        }
        return Metadata.has(fn, MetadataType.Fn);
    }

    // parentFn == null means this is the start of FnMetadata chain
    constructor(parentFn: Function, fnType: FnMetadataType) {
        super(MetadataType.Fn);
        this.parentFn = parentFn;
        this.fnType = fnType;
    }

    public isType(type: FnMetadataType): boolean {
        return this.fnType === type;
    }

    /**
     * Inherit the FnMetadata, return a new object whose parentFn field is fn and other fields are copied
     * @param fn
     */
    public inherit(fn: Function): FnMetadata {
        return new FnMetadata(fn, this.fnType);
    }
}

export class TxHashCallbackMetadata extends FnMetadata {
    public readonly txHash: string;

    constructor(parentFn: Function, txHash: string) {
        super(parentFn, FnMetadataType.TxHashCallback);
        this.txHash = txHash;
    }

    inherit(fn: Function): TxHashCallbackMetadata {
        return new TxHashCallbackMetadata(fn, this.txHash);
    }
}

export class TxConfirmationCallbackMetadata extends FnMetadata {
    public readonly confirmationNumber: number;

    public readonly receipt: Receipt;

    constructor(parentFn: Function, confirmationNumber: number, receipt: Receipt) {
        super(parentFn, FnMetadataType.TxConfirmationCallback);
        this.confirmationNumber = confirmationNumber;
        this.receipt = receipt;
    }

    inherit(fn: Function): TxConfirmationCallbackMetadata {
        return new TxConfirmationCallbackMetadata(fn, this.confirmationNumber, this.receipt);
    }

}

export class TxReceiptCallbackMetadata extends FnMetadata {
    public readonly receipt: Receipt;

    constructor(parentFn: Function, receipt: Receipt) {
        super(parentFn, FnMetadataType.TxReceiptCallback);
        this.receipt = receipt;
    }

    inherit(fn: Function): TxReceiptCallbackMetadata {
        return new TxReceiptCallbackMetadata(fn, this.receipt);
    }
}

export class EventDataCallbackMetadata extends FnMetadata {
    public readonly event: Event;

    constructor(parentFn: Function, event: Event) {
        super(parentFn, FnMetadataType.EventDataCallback);
        this.event = event;
    }

    inherit(fn: Function): EventDataCallbackMetadata {
        return new EventDataCallbackMetadata(fn, this.event);
    }
}

export class EventChangedCallbackMetadata extends FnMetadata {
    public readonly event: Event;

    constructor(parentFn: Function, event: Event) {
        super(parentFn, FnMetadataType.EventChangeCallback);
        this.event = event;
    }

    inherit(fn: Function): EventChangedCallbackMetadata {
        return new EventChangedCallbackMetadata(fn, this.event);
    }
}

/**
 * This class includes some tools to recognize the blockchain interaction callback
 */
export class Recognizer {
    /**
     * returns true if the payload string is a hash string
     * @param payload
     */
    public static isHash(payload: string): boolean {
        if (typeof payload !== "string") {
            return false;
        }
        // hash string must be 256 bits and in hex format
        return payload.startsWith("0x") && payload.length === 66;
    }

    /**
     * returns true if the payload string is an ethereum account
     * @param payload
     */
    public static isAccount(payload: string): boolean {
        if (typeof payload !== "string") {
            return false;
        }
        return payload.startsWith("0x") && payload.length === 42;
    }

    /**
     * returns true if the payload is a receipt object of ethereum transaction
     * @param payload
     */
    public static isReceipt(payload: any): boolean {
        if (payload !== null && typeof payload === "object") {
            if (payload.hasOwnProperty("transactionIndex") && typeof payload["transactionIndex"] === "number" &&
                payload.hasOwnProperty("transactionHash") && Recognizer.isHash(payload["transactionHash"]) &&
                payload.hasOwnProperty("blockHash") && Recognizer.isHash(payload["blockHash"]) &&
                payload.hasOwnProperty("blockNumber") && typeof payload["blockNumber"] === "number" &&
                payload.hasOwnProperty("cumulativeGasUsed") && typeof payload["cumulativeGasUsed"] === "number" &&
                payload.hasOwnProperty("gasUsed") && typeof payload["gasUsed"] === "number") {
                return true;
            }
        }
        return false;
    }

    /**
     * returns true if the payload is the event object of ethereum and the status of remove of the event is the same as isRemoved
     * @param payload
     * @param isRemoved
     */
    public static isEvent(payload: any, isRemoved: boolean = false): boolean {
        if (payload !== null && typeof payload === "object") {
            if (payload.hasOwnProperty("raw") &&
                payload.hasOwnProperty("event") && typeof payload["event"] === "string" &&
                payload.hasOwnProperty("signature") && typeof payload["signature"] === "string" &&
                payload.hasOwnProperty("logIndex") && typeof payload["logIndex"] === "number" &&
                payload.hasOwnProperty("transactionIndex") && typeof payload["transactionIndex"] === "number" &&
                payload.hasOwnProperty("transactionHash") && Recognizer.isHash(payload["transactionHash"]) &&
                payload.hasOwnProperty("blockHash") && Recognizer.isHash(payload["blockHash"]) &&
                payload.hasOwnProperty("blockNumber") && typeof payload["blockNumber"] === "number" &&
                payload.hasOwnProperty("address") && Recognizer.isAccount(payload["address"])) {
                if (isRemoved) {
                    return payload.hasOwnProperty("removed") && payload["removed"] === true;
                }
                return true
            }
        }
        return false;
    }


    /**
     * returns true if the arguments list provided is for txHash callback
     * @param args
     * @param callback: this callback function will be called if the argument list is for txHash callback
     */
    public static checkTxHashCallback(args: any[] | IArguments, callback?: (txHash: string) => void): boolean {
        if (args.length === 1) {
            // this callback signature is used in the 'txHash' PromiEvent callback of sendTransaction
            if (Recognizer.isHash(args[0])) {
                if (callback) callback(args[0]);
                return true;
            }
        } else if (args.length === 2) {
            // this callback signature is used in the default callback of sendTransaction
            if (args[0] === null && Recognizer.isHash(args[1])) {
                if (callback) callback(args[1]);
                return true;
            }
        }
        return false;
    }

    /**
     * returns true if the argument list provided is for confirmation callback
     * @param args
     * @param callback
     */
    public static checkConfirmationCallback(args: any[] | IArguments, callback: (confirmationNumber: number, receipt: object) => void): boolean {
        if (args.length === 2) {
            if (typeof args[0] === "number" && args[0] > 0 && args[0] <= 24 && Recognizer.isReceipt(args[1])) {
                // this callback signature is used in the 'confirmation' PromiEvent callback of sendTransaction
                if (callback) callback(args[0], args[1]);
                return true;
            }
        }
        return false;
    }

    /**
     * returns true if the arguments list provided is for receipt callback
     * @param args
     * @param callback
     */
    public static checkReceiptCallback(args: any[] | IArguments, callback: (receipt: object) => void): boolean {
        if (args.length === 1) {
            if (Recognizer.isReceipt(args[0])) {
                // this callback signature is used in the 'receipt' PromiEvent callback of sendTransaction
                if (callback) callback(args[0]);
                return true;
            }
        }
        return false;
    }

    /**
     * returns true if the arguments list provided is for event data callback
     * @param args
     * @param callback
     */
    public static checkEventDataCallback(args: any[] | IArguments, callback: (event: object) => void): boolean {
        if (args.length === 1) {
            if (Recognizer.isEvent(args[0])) {
                // this callback signature is used in the default callback of contract event subscription
                if (callback) callback(args[0]);
                return true;
            }
        } else if (args.length === 2) {
            if (args[0] === null && Recognizer.isEvent(args[1])) {
                // this callback signature is used in the 'data' PromiEvent callback of contract event subscription
                if (callback) callback(args[1]);
                return true;
            }
        }
        return false;
    }

    /**
     * returns true if the arguments list provided is for event changed callback
     * @param args
     * @param callback
     */
    public static checkEventChangedCallback(args: any[] | IArguments, callback: (event: object) => void): boolean {
        if (args.length === 1) {
            if (Recognizer.isEvent(args[0], true)) {
                // this callback signature is used in the default callback of contract event subscription
                if (callback) callback(args[0]);
                return true;
            }
        } else if (args.length === 2) {
            if (args[0] === null && Recognizer.isEvent(args[1], true)) {
                // this callback signature is used in the 'changed' PromiEvent of contract event subscription
                if (callback) callback(args[1]);
                return true;
            }
        }
        return false;
    }
}

export interface Receipt {
    transactionHash: string
    transactionIndex: number
    blockHash: string
    blockNumber: number
    contractAddress: string
    cumulativeGasUsed: number
    gasUsed: number
    events: Events
}

export interface Events {
    [eventName: string]: Event
}

export interface Event {
    returnValues: object
    raw: {
        data: string
        topics: string
    }
    event: string
    signature: string
    logIndex: number
    transactionIndex: number
    transactionHash: string
    blockHash: string
    blockNumber: number
    address: string
}