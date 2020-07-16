// package: darcher
// file: contract_oracle_service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as contract_oracle_service_pb from "./contract_oracle_service_pb";
import * as common_pb from "./common_pb";

interface IContractVulnerabilityServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getReportsByContractControl: IContractVulnerabilityServiceService_IgetReportsByContractControl;
    getReportsByTransactionControl: IContractVulnerabilityServiceService_IgetReportsByTransactionControl;
}

interface IContractVulnerabilityServiceService_IgetReportsByContractControl extends grpc.MethodDefinition<contract_oracle_service_pb.GetReportsByContractControlMsg, contract_oracle_service_pb.GetReportsByContractControlMsg> {
    path: string; // "/darcher.ContractVulnerabilityService/getReportsByContractControl"
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<contract_oracle_service_pb.GetReportsByContractControlMsg>;
    requestDeserialize: grpc.deserialize<contract_oracle_service_pb.GetReportsByContractControlMsg>;
    responseSerialize: grpc.serialize<contract_oracle_service_pb.GetReportsByContractControlMsg>;
    responseDeserialize: grpc.deserialize<contract_oracle_service_pb.GetReportsByContractControlMsg>;
}
interface IContractVulnerabilityServiceService_IgetReportsByTransactionControl extends grpc.MethodDefinition<contract_oracle_service_pb.GetReportsByTransactionControlMsg, contract_oracle_service_pb.GetReportsByTransactionControlMsg> {
    path: string; // "/darcher.ContractVulnerabilityService/getReportsByTransactionControl"
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
    requestDeserialize: grpc.deserialize<contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
    responseSerialize: grpc.serialize<contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
    responseDeserialize: grpc.deserialize<contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
}

export const ContractVulnerabilityServiceService: IContractVulnerabilityServiceService;

export interface IContractVulnerabilityServiceServer {
    getReportsByContractControl: grpc.handleBidiStreamingCall<contract_oracle_service_pb.GetReportsByContractControlMsg, contract_oracle_service_pb.GetReportsByContractControlMsg>;
    getReportsByTransactionControl: grpc.handleBidiStreamingCall<contract_oracle_service_pb.GetReportsByTransactionControlMsg, contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
}

export interface IContractVulnerabilityServiceClient {
    getReportsByContractControl(): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByContractControlMsg, contract_oracle_service_pb.GetReportsByContractControlMsg>;
    getReportsByContractControl(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByContractControlMsg, contract_oracle_service_pb.GetReportsByContractControlMsg>;
    getReportsByContractControl(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByContractControlMsg, contract_oracle_service_pb.GetReportsByContractControlMsg>;
    getReportsByTransactionControl(): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByTransactionControlMsg, contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
    getReportsByTransactionControl(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByTransactionControlMsg, contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
    getReportsByTransactionControl(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByTransactionControlMsg, contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
}

export class ContractVulnerabilityServiceClient extends grpc.Client implements IContractVulnerabilityServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public getReportsByContractControl(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByContractControlMsg, contract_oracle_service_pb.GetReportsByContractControlMsg>;
    public getReportsByContractControl(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByContractControlMsg, contract_oracle_service_pb.GetReportsByContractControlMsg>;
    public getReportsByTransactionControl(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByTransactionControlMsg, contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
    public getReportsByTransactionControl(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<contract_oracle_service_pb.GetReportsByTransactionControlMsg, contract_oracle_service_pb.GetReportsByTransactionControlMsg>;
}
