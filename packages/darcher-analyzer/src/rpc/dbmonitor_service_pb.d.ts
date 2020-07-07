// package: 
// file: dbmonitor_service.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";

export class ControlMsg extends jspb.Message { 
    getId(): string;
    setId(value: string): ControlMsg;

    getType(): RequestType;
    setType(value: RequestType): ControlMsg;


    hasData(): boolean;
    clearData(): void;
    getData(): google_protobuf_any_pb.Any | undefined;
    setData(value?: google_protobuf_any_pb.Any): ControlMsg;


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
        data?: google_protobuf_any_pb.Any.AsObject,
    }
}

export class TableContent extends jspb.Message { 
    clearKeypathList(): void;
    getKeypathList(): Array<string>;
    setKeypathList(value: Array<string>): TableContent;
    addKeypath(value: string, index?: number): string;

    clearEntriesList(): void;
    getEntriesList(): Array<google_protobuf_any_pb.Any>;
    setEntriesList(value: Array<google_protobuf_any_pb.Any>): TableContent;
    addEntries(value?: google_protobuf_any_pb.Any, index?: number): google_protobuf_any_pb.Any;


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
        entriesList: Array<google_protobuf_any_pb.Any.AsObject>,
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

export enum RequestType {
    GET_ALL_DATA = 0,
}
