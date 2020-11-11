// package: darcher
// file: dapp_test_service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as dapp_test_service_pb from "./dapp_test_service_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import * as common_pb from "./common_pb";

interface IDAppTestDriverServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    notifyTestStart: IDAppTestDriverServiceService_InotifyTestStart;
    notifyTestEnd: IDAppTestDriverServiceService_InotifyTestEnd;
    waitForTxProcess: IDAppTestDriverServiceService_IwaitForTxProcess;
    dappDriverControl: IDAppTestDriverServiceService_IdappDriverControl;
    notifyConsoleError: IDAppTestDriverServiceService_InotifyConsoleError;
}

interface IDAppTestDriverServiceService_InotifyTestStart extends grpc.MethodDefinition<dapp_test_service_pb.TestStartMsg, google_protobuf_empty_pb.Empty> {
    path: "/darcher.DAppTestDriverService/notifyTestStart";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapp_test_service_pb.TestStartMsg>;
    requestDeserialize: grpc.deserialize<dapp_test_service_pb.TestStartMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDAppTestDriverServiceService_InotifyTestEnd extends grpc.MethodDefinition<dapp_test_service_pb.TestEndMsg, google_protobuf_empty_pb.Empty> {
    path: "/darcher.DAppTestDriverService/notifyTestEnd";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapp_test_service_pb.TestEndMsg>;
    requestDeserialize: grpc.deserialize<dapp_test_service_pb.TestEndMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDAppTestDriverServiceService_IwaitForTxProcess extends grpc.MethodDefinition<dapp_test_service_pb.TxMsg, google_protobuf_empty_pb.Empty> {
    path: "/darcher.DAppTestDriverService/waitForTxProcess";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapp_test_service_pb.TxMsg>;
    requestDeserialize: grpc.deserialize<dapp_test_service_pb.TxMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDAppTestDriverServiceService_IdappDriverControl extends grpc.MethodDefinition<dapp_test_service_pb.DAppDriverControlMsg, dapp_test_service_pb.DAppDriverControlMsg> {
    path: "/darcher.DAppTestDriverService/dappDriverControl";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<dapp_test_service_pb.DAppDriverControlMsg>;
    requestDeserialize: grpc.deserialize<dapp_test_service_pb.DAppDriverControlMsg>;
    responseSerialize: grpc.serialize<dapp_test_service_pb.DAppDriverControlMsg>;
    responseDeserialize: grpc.deserialize<dapp_test_service_pb.DAppDriverControlMsg>;
}
interface IDAppTestDriverServiceService_InotifyConsoleError extends grpc.MethodDefinition<dapp_test_service_pb.ConsoleErrorMsg, google_protobuf_empty_pb.Empty> {
    path: "/darcher.DAppTestDriverService/notifyConsoleError";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<dapp_test_service_pb.ConsoleErrorMsg>;
    requestDeserialize: grpc.deserialize<dapp_test_service_pb.ConsoleErrorMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}

export const DAppTestDriverServiceService: IDAppTestDriverServiceService;

export interface IDAppTestDriverServiceServer {
    notifyTestStart: grpc.handleUnaryCall<dapp_test_service_pb.TestStartMsg, google_protobuf_empty_pb.Empty>;
    notifyTestEnd: grpc.handleUnaryCall<dapp_test_service_pb.TestEndMsg, google_protobuf_empty_pb.Empty>;
    waitForTxProcess: grpc.handleUnaryCall<dapp_test_service_pb.TxMsg, google_protobuf_empty_pb.Empty>;
    dappDriverControl: grpc.handleBidiStreamingCall<dapp_test_service_pb.DAppDriverControlMsg, dapp_test_service_pb.DAppDriverControlMsg>;
    notifyConsoleError: grpc.handleUnaryCall<dapp_test_service_pb.ConsoleErrorMsg, google_protobuf_empty_pb.Empty>;
}

export interface IDAppTestDriverServiceClient {
    notifyTestStart(request: dapp_test_service_pb.TestStartMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTestStart(request: dapp_test_service_pb.TestStartMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTestStart(request: dapp_test_service_pb.TestStartMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTestEnd(request: dapp_test_service_pb.TestEndMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTestEnd(request: dapp_test_service_pb.TestEndMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTestEnd(request: dapp_test_service_pb.TestEndMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    waitForTxProcess(request: dapp_test_service_pb.TxMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    waitForTxProcess(request: dapp_test_service_pb.TxMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    waitForTxProcess(request: dapp_test_service_pb.TxMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    dappDriverControl(): grpc.ClientDuplexStream<dapp_test_service_pb.DAppDriverControlMsg, dapp_test_service_pb.DAppDriverControlMsg>;
    dappDriverControl(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<dapp_test_service_pb.DAppDriverControlMsg, dapp_test_service_pb.DAppDriverControlMsg>;
    dappDriverControl(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<dapp_test_service_pb.DAppDriverControlMsg, dapp_test_service_pb.DAppDriverControlMsg>;
    notifyConsoleError(request: dapp_test_service_pb.ConsoleErrorMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyConsoleError(request: dapp_test_service_pb.ConsoleErrorMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyConsoleError(request: dapp_test_service_pb.ConsoleErrorMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
}

export class DAppTestDriverServiceClient extends grpc.Client implements IDAppTestDriverServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public notifyTestStart(request: dapp_test_service_pb.TestStartMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTestStart(request: dapp_test_service_pb.TestStartMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTestStart(request: dapp_test_service_pb.TestStartMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTestEnd(request: dapp_test_service_pb.TestEndMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTestEnd(request: dapp_test_service_pb.TestEndMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTestEnd(request: dapp_test_service_pb.TestEndMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public waitForTxProcess(request: dapp_test_service_pb.TxMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public waitForTxProcess(request: dapp_test_service_pb.TxMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public waitForTxProcess(request: dapp_test_service_pb.TxMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public dappDriverControl(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<dapp_test_service_pb.DAppDriverControlMsg, dapp_test_service_pb.DAppDriverControlMsg>;
    public dappDriverControl(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<dapp_test_service_pb.DAppDriverControlMsg, dapp_test_service_pb.DAppDriverControlMsg>;
    public notifyConsoleError(request: dapp_test_service_pb.ConsoleErrorMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyConsoleError(request: dapp_test_service_pb.ConsoleErrorMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyConsoleError(request: dapp_test_service_pb.ConsoleErrorMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
}
