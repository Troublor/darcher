// package: darcher
// file: dapp_test_driver_service.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as common_pb from "./common_pb";

export class TestStartMsg extends jspb.Message { 
    getDappName(): string;
    setDappName(value: string): TestStartMsg;

    getInstanceId(): string;
    setInstanceId(value: string): TestStartMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TestStartMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TestStartMsg): TestStartMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TestStartMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TestStartMsg;
    static deserializeBinaryFromReader(message: TestStartMsg, reader: jspb.BinaryReader): TestStartMsg;
}

export namespace TestStartMsg {
    export type AsObject = {
        dappName: string,
        instanceId: string,
    }
}

export class TestEndMsg extends jspb.Message { 
    getDappName(): string;
    setDappName(value: string): TestEndMsg;

    getInstanceId(): string;
    setInstanceId(value: string): TestEndMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TestEndMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TestEndMsg): TestEndMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TestEndMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TestEndMsg;
    static deserializeBinaryFromReader(message: TestEndMsg, reader: jspb.BinaryReader): TestEndMsg;
}

export namespace TestEndMsg {
    export type AsObject = {
        dappName: string,
        instanceId: string,
    }
}

export class TxMsg extends jspb.Message { 
    getDappName(): string;
    setDappName(value: string): TxMsg;

    getInstanceId(): string;
    setInstanceId(value: string): TxMsg;

    getHash(): string;
    setHash(value: string): TxMsg;

    getFrom(): string;
    setFrom(value: string): TxMsg;

    getTo(): string;
    setTo(value: string): TxMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TxMsg.AsObject;
    static toObject(includeInstance: boolean, msg: TxMsg): TxMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TxMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TxMsg;
    static deserializeBinaryFromReader(message: TxMsg, reader: jspb.BinaryReader): TxMsg;
}

export namespace TxMsg {
    export type AsObject = {
        dappName: string,
        instanceId: string,
        hash: string,
        from: string,
        to: string,
    }
}

export class ConsoleErrorMsg extends jspb.Message { 
    getDappName(): string;
    setDappName(value: string): ConsoleErrorMsg;

    getInstanceId(): string;
    setInstanceId(value: string): ConsoleErrorMsg;

    getErrorString(): string;
    setErrorString(value: string): ConsoleErrorMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConsoleErrorMsg.AsObject;
    static toObject(includeInstance: boolean, msg: ConsoleErrorMsg): ConsoleErrorMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConsoleErrorMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConsoleErrorMsg;
    static deserializeBinaryFromReader(message: ConsoleErrorMsg, reader: jspb.BinaryReader): ConsoleErrorMsg;
}

export namespace ConsoleErrorMsg {
    export type AsObject = {
        dappName: string,
        instanceId: string,
        errorString: string,
    }
}

export class DAppDriverControlMsg extends jspb.Message { 
    getRole(): common_pb.Role;
    setRole(value: common_pb.Role): DAppDriverControlMsg;

    getId(): string;
    setId(value: string): DAppDriverControlMsg;

    getDappName(): string;
    setDappName(value: string): DAppDriverControlMsg;

    getInstanceId(): string;
    setInstanceId(value: string): DAppDriverControlMsg;

    getControlType(): DAppDriverControlType;
    setControlType(value: DAppDriverControlType): DAppDriverControlMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DAppDriverControlMsg.AsObject;
    static toObject(includeInstance: boolean, msg: DAppDriverControlMsg): DAppDriverControlMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DAppDriverControlMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DAppDriverControlMsg;
    static deserializeBinaryFromReader(message: DAppDriverControlMsg, reader: jspb.BinaryReader): DAppDriverControlMsg;
}

export namespace DAppDriverControlMsg {
    export type AsObject = {
        role: common_pb.Role,
        id: string,
        dappName: string,
        instanceId: string,
        controlType: DAppDriverControlType,
    }
}

export enum DAppDriverControlType {
    NILTYPE = 0,
    REFRESH = 1,
}
