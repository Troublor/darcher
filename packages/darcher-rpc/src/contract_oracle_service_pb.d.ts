// package: darcher
// file: contract_oracle_service.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as common_pb from "./common_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class GetReportsByContractControlMsg extends jspb.Message { 
    getRole(): common_pb.Role;
    setRole(value: common_pb.Role): GetReportsByContractControlMsg;

    getId(): string;
    setId(value: string): GetReportsByContractControlMsg;

    getAddress(): string;
    setAddress(value: string): GetReportsByContractControlMsg;

    clearReportsList(): void;
    getReportsList(): Array<ContractVulReport>;
    setReportsList(value: Array<ContractVulReport>): GetReportsByContractControlMsg;
    addReports(value?: ContractVulReport, index?: number): ContractVulReport;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetReportsByContractControlMsg.AsObject;
    static toObject(includeInstance: boolean, msg: GetReportsByContractControlMsg): GetReportsByContractControlMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetReportsByContractControlMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetReportsByContractControlMsg;
    static deserializeBinaryFromReader(message: GetReportsByContractControlMsg, reader: jspb.BinaryReader): GetReportsByContractControlMsg;
}

export namespace GetReportsByContractControlMsg {
    export type AsObject = {
        role: common_pb.Role,
        id: string,
        address: string,
        reportsList: Array<ContractVulReport.AsObject>,
    }
}

export class GetReportsByTransactionControlMsg extends jspb.Message { 
    getRole(): common_pb.Role;
    setRole(value: common_pb.Role): GetReportsByTransactionControlMsg;

    getId(): string;
    setId(value: string): GetReportsByTransactionControlMsg;

    getHash(): string;
    setHash(value: string): GetReportsByTransactionControlMsg;

    clearReportsList(): void;
    getReportsList(): Array<ContractVulReport>;
    setReportsList(value: Array<ContractVulReport>): GetReportsByTransactionControlMsg;
    addReports(value?: ContractVulReport, index?: number): ContractVulReport;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetReportsByTransactionControlMsg.AsObject;
    static toObject(includeInstance: boolean, msg: GetReportsByTransactionControlMsg): GetReportsByTransactionControlMsg.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetReportsByTransactionControlMsg, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetReportsByTransactionControlMsg;
    static deserializeBinaryFromReader(message: GetReportsByTransactionControlMsg, reader: jspb.BinaryReader): GetReportsByTransactionControlMsg;
}

export namespace GetReportsByTransactionControlMsg {
    export type AsObject = {
        role: common_pb.Role,
        id: string,
        hash: string,
        reportsList: Array<ContractVulReport.AsObject>,
    }
}

export class ContractVulReport extends jspb.Message { 
    getAddress(): string;
    setAddress(value: string): ContractVulReport;

    getFuncSig(): string;
    setFuncSig(value: string): ContractVulReport;

    getOpcode(): string;
    setOpcode(value: string): ContractVulReport;

    getPc(): number;
    setPc(value: number): ContractVulReport;

    getTxHash(): string;
    setTxHash(value: string): ContractVulReport;

    getType(): ContractVulType;
    setType(value: ContractVulType): ContractVulReport;

    getDescription(): string;
    setDescription(value: string): ContractVulReport;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ContractVulReport.AsObject;
    static toObject(includeInstance: boolean, msg: ContractVulReport): ContractVulReport.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ContractVulReport, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ContractVulReport;
    static deserializeBinaryFromReader(message: ContractVulReport, reader: jspb.BinaryReader): ContractVulReport;
}

export namespace ContractVulReport {
    export type AsObject = {
        address: string,
        funcSig: string,
        opcode: string,
        pc: number,
        txHash: string,
        type: ContractVulType,
        description: string,
    }
}

export enum ContractVulType {
    NIL = 0,
    EXCEPTION_DISORDER = 1,
    REENTRANCY = 2,
    TIMESTAMP_DEPENDENCY = 3,
    BLOCKNUMBER_DEPENDENCY = 4,
    DANGEROUS_DELEGATECALL = 5,
    GASLESS_SEND = 6,
}
