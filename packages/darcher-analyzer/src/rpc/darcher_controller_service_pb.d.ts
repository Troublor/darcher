// package: darcher
// file: darcher_controller_service.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as common_pb from "./common_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class TxReceivedMsg extends jspb.Message { 
    getHash(): string;
    setHash(value: string): TxReceivedMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TxReceivedMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TxReceivedMsg): TxReceivedMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TxReceivedMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TxReceivedMsg;
    static deserializeBinaryFromReader(message: TxReceivedMsg, reader: jspb.BinaryReader): TxReceivedMsg;
}

export namespace TxReceivedMsg {
    export type AsObject = {
        hash: string,
    }
}

export class TxFinishedMsg extends jspb.Message { 
    getHash(): string;
    setHash(value: string): TxFinishedMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TxFinishedMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TxFinishedMsg): TxFinishedMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TxFinishedMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TxFinishedMsg;
    static deserializeBinaryFromReader(message: TxFinishedMsg, reader: jspb.BinaryReader): TxFinishedMsg;
}

export namespace TxFinishedMsg {
    export type AsObject = {
        hash: string,
    }
}

export class TxTraverseStartMsg extends jspb.Message { 
    getHash(): string;
    setHash(value: string): TxTraverseStartMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TxTraverseStartMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TxTraverseStartMsg): TxTraverseStartMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TxTraverseStartMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TxTraverseStartMsg;
    static deserializeBinaryFromReader(message: TxTraverseStartMsg, reader: jspb.BinaryReader): TxTraverseStartMsg;
}

export namespace TxTraverseStartMsg {
    export type AsObject = {
        hash: string,
    }
}

export class TxStateChangeMsg extends jspb.Message { 
    getHash(): string;
    setHash(value: string): TxStateChangeMsg;

    getFrom(): common_pb.TxState;
    setFrom(value: common_pb.TxState): TxStateChangeMsg;

    getTo(): common_pb.TxState;
    setTo(value: common_pb.TxState): TxStateChangeMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TxStateChangeMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TxStateChangeMsg): TxStateChangeMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TxStateChangeMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TxStateChangeMsg;
    static deserializeBinaryFromReader(message: TxStateChangeMsg, reader: jspb.BinaryReader): TxStateChangeMsg;
}

export namespace TxStateChangeMsg {
    export type AsObject = {
        hash: string,
        from: common_pb.TxState,
        to: common_pb.TxState,
    }
}

export class TxStateControlMsg extends jspb.Message { 
    getHash(): string;
    setHash(value: string): TxStateControlMsg;

    getCurrentState(): common_pb.TxState;
    setCurrentState(value: common_pb.TxState): TxStateControlMsg;

    getNextState(): common_pb.TxState;
    setNextState(value: common_pb.TxState): TxStateControlMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TxStateControlMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TxStateControlMsg): TxStateControlMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TxStateControlMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TxStateControlMsg;
    static deserializeBinaryFromReader(message: TxStateControlMsg, reader: jspb.BinaryReader): TxStateControlMsg;
}

export namespace TxStateControlMsg {
    export type AsObject = {
        hash: string,
        currentState: common_pb.TxState,
        nextState: common_pb.TxState,
    }
}

export class SelectTxControlMsg extends jspb.Message { 
    clearCandidateHashesList(): void;
    getCandidateHashesList(): Array<string>;
    setCandidateHashesList(value: Array<string>): SelectTxControlMsg;
    addCandidateHashes(value: string, index?: number): string;

    getSelection(): string;
    setSelection(value: string): SelectTxControlMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SelectTxControlMsg.AsObject;
    static toObject(includeInstance: boolean, msg: SelectTxControlMsg): SelectTxControlMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SelectTxControlMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SelectTxControlMsg;
    static deserializeBinaryFromReader(message: SelectTxControlMsg, reader: jspb.BinaryReader): SelectTxControlMsg;
}

export namespace SelectTxControlMsg {
    export type AsObject = {
        candidateHashesList: Array<string>,
        selection: string,
    }
}
