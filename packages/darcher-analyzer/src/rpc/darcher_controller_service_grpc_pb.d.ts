// package: darcher
// file: darcher_controller_service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as darcher_controller_service_pb from "./darcher_controller_service_pb";
import * as common_pb from "./common_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IDarcherControllerServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    notifyTxReceived: IDarcherControllerServiceService_InotifyTxReceived;
    notifyTxFinished: IDarcherControllerServiceService_InotifyTxFinished;
    notifyTxTraverseStart: IDarcherControllerServiceService_InotifyTxTraverseStart;
    notifyTxStateChangeMsg: IDarcherControllerServiceService_InotifyTxStateChangeMsg;
    askForNextState: IDarcherControllerServiceService_IaskForNextState;
    selectTx: IDarcherControllerServiceService_IselectTx;
}

interface IDarcherControllerServiceService_InotifyTxReceived extends grpc.MethodDefinition<darcher_controller_service_pb.TxReceivedMsg, google_protobuf_empty_pb.Empty> {
    path: string; // "/darcher.DarcherControllerService/notifyTxReceived"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<darcher_controller_service_pb.TxReceivedMsg>;
    requestDeserialize: grpc.deserialize<darcher_controller_service_pb.TxReceivedMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDarcherControllerServiceService_InotifyTxFinished extends grpc.MethodDefinition<darcher_controller_service_pb.TxFinishedMsg, google_protobuf_empty_pb.Empty> {
    path: string; // "/darcher.DarcherControllerService/notifyTxFinished"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<darcher_controller_service_pb.TxFinishedMsg>;
    requestDeserialize: grpc.deserialize<darcher_controller_service_pb.TxFinishedMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDarcherControllerServiceService_InotifyTxTraverseStart extends grpc.MethodDefinition<darcher_controller_service_pb.TxTraverseStartMsg, google_protobuf_empty_pb.Empty> {
    path: string; // "/darcher.DarcherControllerService/notifyTxTraverseStart"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<darcher_controller_service_pb.TxTraverseStartMsg>;
    requestDeserialize: grpc.deserialize<darcher_controller_service_pb.TxTraverseStartMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDarcherControllerServiceService_InotifyTxStateChangeMsg extends grpc.MethodDefinition<darcher_controller_service_pb.TxStateChangeMsg, google_protobuf_empty_pb.Empty> {
    path: string; // "/darcher.DarcherControllerService/notifyTxStateChangeMsg"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<darcher_controller_service_pb.TxStateChangeMsg>;
    requestDeserialize: grpc.deserialize<darcher_controller_service_pb.TxStateChangeMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IDarcherControllerServiceService_IaskForNextState extends grpc.MethodDefinition<darcher_controller_service_pb.TxStateControlMsg, darcher_controller_service_pb.TxStateControlMsg> {
    path: string; // "/darcher.DarcherControllerService/askForNextState"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<darcher_controller_service_pb.TxStateControlMsg>;
    requestDeserialize: grpc.deserialize<darcher_controller_service_pb.TxStateControlMsg>;
    responseSerialize: grpc.serialize<darcher_controller_service_pb.TxStateControlMsg>;
    responseDeserialize: grpc.deserialize<darcher_controller_service_pb.TxStateControlMsg>;
}
interface IDarcherControllerServiceService_IselectTx extends grpc.MethodDefinition<darcher_controller_service_pb.SelectTxControlMsg, darcher_controller_service_pb.SelectTxControlMsg> {
    path: string; // "/darcher.DarcherControllerService/selectTx"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<darcher_controller_service_pb.SelectTxControlMsg>;
    requestDeserialize: grpc.deserialize<darcher_controller_service_pb.SelectTxControlMsg>;
    responseSerialize: grpc.serialize<darcher_controller_service_pb.SelectTxControlMsg>;
    responseDeserialize: grpc.deserialize<darcher_controller_service_pb.SelectTxControlMsg>;
}

export const DarcherControllerServiceService: IDarcherControllerServiceService;

export interface IDarcherControllerServiceServer {
    notifyTxReceived: grpc.handleUnaryCall<darcher_controller_service_pb.TxReceivedMsg, google_protobuf_empty_pb.Empty>;
    notifyTxFinished: grpc.handleUnaryCall<darcher_controller_service_pb.TxFinishedMsg, google_protobuf_empty_pb.Empty>;
    notifyTxTraverseStart: grpc.handleUnaryCall<darcher_controller_service_pb.TxTraverseStartMsg, google_protobuf_empty_pb.Empty>;
    notifyTxStateChangeMsg: grpc.handleUnaryCall<darcher_controller_service_pb.TxStateChangeMsg, google_protobuf_empty_pb.Empty>;
    askForNextState: grpc.handleUnaryCall<darcher_controller_service_pb.TxStateControlMsg, darcher_controller_service_pb.TxStateControlMsg>;
    selectTx: grpc.handleUnaryCall<darcher_controller_service_pb.SelectTxControlMsg, darcher_controller_service_pb.SelectTxControlMsg>;
}

export interface IDarcherControllerServiceClient {
    notifyTxReceived(request: darcher_controller_service_pb.TxReceivedMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxReceived(request: darcher_controller_service_pb.TxReceivedMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxReceived(request: darcher_controller_service_pb.TxReceivedMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxFinished(request: darcher_controller_service_pb.TxFinishedMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxFinished(request: darcher_controller_service_pb.TxFinishedMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxFinished(request: darcher_controller_service_pb.TxFinishedMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxTraverseStart(request: darcher_controller_service_pb.TxTraverseStartMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxTraverseStart(request: darcher_controller_service_pb.TxTraverseStartMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxTraverseStart(request: darcher_controller_service_pb.TxTraverseStartMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxStateChangeMsg(request: darcher_controller_service_pb.TxStateChangeMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxStateChangeMsg(request: darcher_controller_service_pb.TxStateChangeMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxStateChangeMsg(request: darcher_controller_service_pb.TxStateChangeMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    askForNextState(request: darcher_controller_service_pb.TxStateControlMsg, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    askForNextState(request: darcher_controller_service_pb.TxStateControlMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    askForNextState(request: darcher_controller_service_pb.TxStateControlMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    selectTx(request: darcher_controller_service_pb.SelectTxControlMsg, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
    selectTx(request: darcher_controller_service_pb.SelectTxControlMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
    selectTx(request: darcher_controller_service_pb.SelectTxControlMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
}

export class DarcherControllerServiceClient extends grpc.Client implements IDarcherControllerServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public notifyTxReceived(request: darcher_controller_service_pb.TxReceivedMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxReceived(request: darcher_controller_service_pb.TxReceivedMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxReceived(request: darcher_controller_service_pb.TxReceivedMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxFinished(request: darcher_controller_service_pb.TxFinishedMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxFinished(request: darcher_controller_service_pb.TxFinishedMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxFinished(request: darcher_controller_service_pb.TxFinishedMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxTraverseStart(request: darcher_controller_service_pb.TxTraverseStartMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxTraverseStart(request: darcher_controller_service_pb.TxTraverseStartMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxTraverseStart(request: darcher_controller_service_pb.TxTraverseStartMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxStateChangeMsg(request: darcher_controller_service_pb.TxStateChangeMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxStateChangeMsg(request: darcher_controller_service_pb.TxStateChangeMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxStateChangeMsg(request: darcher_controller_service_pb.TxStateChangeMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public askForNextState(request: darcher_controller_service_pb.TxStateControlMsg, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    public askForNextState(request: darcher_controller_service_pb.TxStateControlMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    public askForNextState(request: darcher_controller_service_pb.TxStateControlMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    public selectTx(request: darcher_controller_service_pb.SelectTxControlMsg, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
    public selectTx(request: darcher_controller_service_pb.SelectTxControlMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
    public selectTx(request: darcher_controller_service_pb.SelectTxControlMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: darcher_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
}
