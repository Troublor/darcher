// package: darcher
// file: dbmonitor_service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as dbmonitor_service_pb from "./dbmonitor_service_pb";
import * as common_pb from "./common_pb";

interface IDBMonitorServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getAllDataControl: IDBMonitorServiceService_IgetAllDataControl;
}

interface IDBMonitorServiceService_IgetAllDataControl extends grpc.MethodDefinition<dbmonitor_service_pb.GetAllDataControlMsg, dbmonitor_service_pb.GetAllDataControlMsg> {
    path: "/darcher.DBMonitorService/getAllDataControl";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<dbmonitor_service_pb.GetAllDataControlMsg>;
    requestDeserialize: grpc.deserialize<dbmonitor_service_pb.GetAllDataControlMsg>;
    responseSerialize: grpc.serialize<dbmonitor_service_pb.GetAllDataControlMsg>;
    responseDeserialize: grpc.deserialize<dbmonitor_service_pb.GetAllDataControlMsg>;
}

export const DBMonitorServiceService: IDBMonitorServiceService;

export interface IDBMonitorServiceServer {
    getAllDataControl: grpc.handleBidiStreamingCall<dbmonitor_service_pb.GetAllDataControlMsg, dbmonitor_service_pb.GetAllDataControlMsg>;
}

export interface IDBMonitorServiceClient {
    getAllDataControl(): grpc.ClientDuplexStream<dbmonitor_service_pb.GetAllDataControlMsg, dbmonitor_service_pb.GetAllDataControlMsg>;
    getAllDataControl(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<dbmonitor_service_pb.GetAllDataControlMsg, dbmonitor_service_pb.GetAllDataControlMsg>;
    getAllDataControl(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<dbmonitor_service_pb.GetAllDataControlMsg, dbmonitor_service_pb.GetAllDataControlMsg>;
}

export class DBMonitorServiceClient extends grpc.Client implements IDBMonitorServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public getAllDataControl(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<dbmonitor_service_pb.GetAllDataControlMsg, dbmonitor_service_pb.GetAllDataControlMsg>;
    public getAllDataControl(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<dbmonitor_service_pb.GetAllDataControlMsg, dbmonitor_service_pb.GetAllDataControlMsg>;
}
