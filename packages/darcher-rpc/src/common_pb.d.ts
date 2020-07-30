// package: darcher
// file: common.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class TxErrorMsg extends jspb.Message { 
    getHash(): string;
    setHash(value: string): TxErrorMsg;

    getType(): TxErrorType;
    setType(value: TxErrorType): TxErrorMsg;

    getDescription(): string;
    setDescription(value: string): TxErrorMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TxErrorMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TxErrorMsg): TxErrorMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TxErrorMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TxErrorMsg;
    static deserializeBinaryFromReader(message: TxErrorMsg, reader: jspb.BinaryReader): TxErrorMsg;
}

export namespace TxErrorMsg {
    export type AsObject = {
        hash: string,
        type: TxErrorType,
        description: string,
    }
}

export enum Role {
    DOER = 0,
    TALKER = 1,
    DAPP = 2,
    DBMONITOR = 3,
}

export enum Error {
    NILERR = 0,
    INTERNALERR = 1,
    TIMEOUTERR = 2,
    SERVICENOTAVAILABLEERR = 3,
}

export enum TxState {
    CREATED = 0,
    PENDING = 1,
    EXECUTED = 2,
    DROPPED = 3,
    CONFIRMED = 4,
}

export enum TxErrorType {
    NIL_TXERR = 0,
    REVERT = 1,
    REJECT = 2,
}
