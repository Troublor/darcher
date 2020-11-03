// package: darcher
// file: dbmonitor_service.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as common_pb from "./common_pb";

export class ControlMsg extends jspb.Message { 
    getId(): string;
    setId(value: string): ControlMsg;

    getType(): RequestType;
    setType(value: RequestType): ControlMsg;

    getDbAddress(): string;
    setDbAddress(value: string): ControlMsg;

    getDbName(): string;
    setDbName(value: string): ControlMsg;

    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): ControlMsg;

    getErr(): common_pb.Error;
    setErr(value: common_pb.Error): ControlMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ControlMsg.AsObject;
    static toObject(includeInstance: boolean, msg: ControlMsg): ControlMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ControlMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ControlMsg;
    static deserializeBinaryFromReader(message: ControlMsg, reader: jspb.BinaryReader): ControlMsg;
}

export namespace ControlMsg {
    export type AsObject = {
        id: string,
        type: RequestType,
        dbAddress: string,
        dbName: string,
        data: Uint8Array | string,
        err: common_pb.Error,
    }
}

export class TableContent extends jspb.Message { 
    clearKeypathList(): void;
    getKeypathList(): Array<string>;
    setKeypathList(value: Array<string>): TableContent;
    addKeypath(value: string, index?: number): string;

    clearEntriesList(): void;
    getEntriesList(): Array<string>;
    setEntriesList(value: Array<string>): TableContent;
    addEntries(value: string, index?: number): string;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TableContent.AsObject;
    static toObject(includeInstance: boolean, msg: TableContent): TableContent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TableContent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TableContent;
    static deserializeBinaryFromReader(message: TableContent, reader: jspb.BinaryReader): TableContent;
}

export namespace TableContent {
    export type AsObject = {
        keypathList: Array<string>,
        entriesList: Array<string>,
    }
}

export class DBContent extends jspb.Message { 

    getTablesMap(): jspb.Map<string, TableContent>;
    clearTablesMap(): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DBContent.AsObject;
    static toObject(includeInstance: boolean, msg: DBContent): DBContent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DBContent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DBContent;
    static deserializeBinaryFromReader(message: DBContent, reader: jspb.BinaryReader): DBContent;
}

export namespace DBContent {
    export type AsObject = {

        tablesMap: Array<[string, TableContent.AsObject]>,
    }
}

export class GetAllDataControlMsg extends jspb.Message { 
    getRole(): common_pb.Role;
    setRole(value: common_pb.Role): GetAllDataControlMsg;

    getId(): string;
    setId(value: string): GetAllDataControlMsg;

    getDbAddress(): string;
    setDbAddress(value: string): GetAllDataControlMsg;

    getDbName(): string;
    setDbName(value: string): GetAllDataControlMsg;


    hasContent(): boolean;
    clearContent(): void;
    getContent(): DBContent | undefined;
    setContent(value?: DBContent): GetAllDataControlMsg;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetAllDataControlMsg.AsObject;
    static toObject(includeInstance: boolean, msg: GetAllDataControlMsg): GetAllDataControlMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetAllDataControlMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetAllDataControlMsg;
    static deserializeBinaryFromReader(message: GetAllDataControlMsg, reader: jspb.BinaryReader): GetAllDataControlMsg;
}

export namespace GetAllDataControlMsg {
    export type AsObject = {
        role: common_pb.Role,
        id: string,
        dbAddress: string,
        dbName: string,
        content?: DBContent.AsObject,
    }
}

export enum RequestType {
    GET_ALL_DATA = 0,
    REFRESH_PAGE = 1,
}
