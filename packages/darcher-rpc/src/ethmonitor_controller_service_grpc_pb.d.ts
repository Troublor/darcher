// package: darcher
// file: ethmonitor_controller_service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as ethmonitor_controller_service_pb from "./ethmonitor_controller_service_pb";
import * as common_pb from "./common_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IEthmonitorControllerServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    notifyTxReceived: IEthmonitorControllerServiceService_InotifyTxReceived;
    notifyTxFinished: IEthmonitorControllerServiceService_InotifyTxFinished;
    notifyTxTraverseStart: IEthmonitorControllerServiceService_InotifyTxTraverseStart;
    notifyTxStateChangeMsg: IEthmonitorControllerServiceService_InotifyTxStateChangeMsg;
    askForNextState: IEthmonitorControllerServiceService_IaskForNextState;
    selectTx: IEthmonitorControllerServiceService_IselectTx;
}

interface IEthmonitorControllerServiceService_InotifyTxReceived extends grpc.MethodDefinition<ethmonitor_controller_service_pb.TxReceivedMsg, google_protobuf_empty_pb.Empty> {
    path: string; // "/darcher.EthmonitorControllerService/notifyTxReceived"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<ethmonitor_controller_service_pb.TxReceivedMsg>;
    requestDeserialize: grpc.deserialize<ethmonitor_controller_service_pb.TxReceivedMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IEthmonitorControllerServiceService_InotifyTxFinished extends grpc.MethodDefinition<ethmonitor_controller_service_pb.TxFinishedMsg, google_protobuf_empty_pb.Empty> {
    path: string; // "/darcher.EthmonitorControllerService/notifyTxFinished"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<ethmonitor_controller_service_pb.TxFinishedMsg>;
    requestDeserialize: grpc.deserialize<ethmonitor_controller_service_pb.TxFinishedMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IEthmonitorControllerServiceService_InotifyTxTraverseStart extends grpc.MethodDefinition<ethmonitor_controller_service_pb.TxTraverseStartMsg, google_protobuf_empty_pb.Empty> {
    path: string; // "/darcher.EthmonitorControllerService/notifyTxTraverseStart"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<ethmonitor_controller_service_pb.TxTraverseStartMsg>;
    requestDeserialize: grpc.deserialize<ethmonitor_controller_service_pb.TxTraverseStartMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IEthmonitorControllerServiceService_InotifyTxStateChangeMsg extends grpc.MethodDefinition<ethmonitor_controller_service_pb.TxStateChangeMsg, google_protobuf_empty_pb.Empty> {
    path: string; // "/darcher.EthmonitorControllerService/notifyTxStateChangeMsg"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<ethmonitor_controller_service_pb.TxStateChangeMsg>;
    requestDeserialize: grpc.deserialize<ethmonitor_controller_service_pb.TxStateChangeMsg>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IEthmonitorControllerServiceService_IaskForNextState extends grpc.MethodDefinition<ethmonitor_controller_service_pb.TxStateControlMsg, ethmonitor_controller_service_pb.TxStateControlMsg> {
    path: string; // "/darcher.EthmonitorControllerService/askForNextState"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<ethmonitor_controller_service_pb.TxStateControlMsg>;
    requestDeserialize: grpc.deserialize<ethmonitor_controller_service_pb.TxStateControlMsg>;
    responseSerialize: grpc.serialize<ethmonitor_controller_service_pb.TxStateControlMsg>;
    responseDeserialize: grpc.deserialize<ethmonitor_controller_service_pb.TxStateControlMsg>;
}
interface IEthmonitorControllerServiceService_IselectTx extends grpc.MethodDefinition<ethmonitor_controller_service_pb.SelectTxControlMsg, ethmonitor_controller_service_pb.SelectTxControlMsg> {
    path: string; // "/darcher.EthmonitorControllerService/selectTx"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<ethmonitor_controller_service_pb.SelectTxControlMsg>;
    requestDeserialize: grpc.deserialize<ethmonitor_controller_service_pb.SelectTxControlMsg>;
    responseSerialize: grpc.serialize<ethmonitor_controller_service_pb.SelectTxControlMsg>;
    responseDeserialize: grpc.deserialize<ethmonitor_controller_service_pb.SelectTxControlMsg>;
}

export const EthmonitorControllerServiceService: IEthmonitorControllerServiceService;

export interface IEthmonitorControllerServiceServer {
    notifyTxReceived: grpc.handleUnaryCall<ethmonitor_controller_service_pb.TxReceivedMsg, google_protobuf_empty_pb.Empty>;
    notifyTxFinished: grpc.handleUnaryCall<ethmonitor_controller_service_pb.TxFinishedMsg, google_protobuf_empty_pb.Empty>;
    notifyTxTraverseStart: grpc.handleUnaryCall<ethmonitor_controller_service_pb.TxTraverseStartMsg, google_protobuf_empty_pb.Empty>;
    notifyTxStateChangeMsg: grpc.handleUnaryCall<ethmonitor_controller_service_pb.TxStateChangeMsg, google_protobuf_empty_pb.Empty>;
    askForNextState: grpc.handleUnaryCall<ethmonitor_controller_service_pb.TxStateControlMsg, ethmonitor_controller_service_pb.TxStateControlMsg>;
    selectTx: grpc.handleUnaryCall<ethmonitor_controller_service_pb.SelectTxControlMsg, ethmonitor_controller_service_pb.SelectTxControlMsg>;
}

export interface IEthmonitorControllerServiceClient {
    notifyTxReceived(request: ethmonitor_controller_service_pb.TxReceivedMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxReceived(request: ethmonitor_controller_service_pb.TxReceivedMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxReceived(request: ethmonitor_controller_service_pb.TxReceivedMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxFinished(request: ethmonitor_controller_service_pb.TxFinishedMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxFinished(request: ethmonitor_controller_service_pb.TxFinishedMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxFinished(request: ethmonitor_controller_service_pb.TxFinishedMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxTraverseStart(request: ethmonitor_controller_service_pb.TxTraverseStartMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxTraverseStart(request: ethmonitor_controller_service_pb.TxTraverseStartMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxTraverseStart(request: ethmonitor_controller_service_pb.TxTraverseStartMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxStateChangeMsg(request: ethmonitor_controller_service_pb.TxStateChangeMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxStateChangeMsg(request: ethmonitor_controller_service_pb.TxStateChangeMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    notifyTxStateChangeMsg(request: ethmonitor_controller_service_pb.TxStateChangeMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    askForNextState(request: ethmonitor_controller_service_pb.TxStateControlMsg, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    askForNextState(request: ethmonitor_controller_service_pb.TxStateControlMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    askForNextState(request: ethmonitor_controller_service_pb.TxStateControlMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    selectTx(request: ethmonitor_controller_service_pb.SelectTxControlMsg, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
    selectTx(request: ethmonitor_controller_service_pb.SelectTxControlMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
    selectTx(request: ethmonitor_controller_service_pb.SelectTxControlMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
}

export class EthmonitorControllerServiceClient extends grpc.Client implements IEthmonitorControllerServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public notifyTxReceived(request: ethmonitor_controller_service_pb.TxReceivedMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxReceived(request: ethmonitor_controller_service_pb.TxReceivedMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxReceived(request: ethmonitor_controller_service_pb.TxReceivedMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxFinished(request: ethmonitor_controller_service_pb.TxFinishedMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxFinished(request: ethmonitor_controller_service_pb.TxFinishedMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxFinished(request: ethmonitor_controller_service_pb.TxFinishedMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxTraverseStart(request: ethmonitor_controller_service_pb.TxTraverseStartMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxTraverseStart(request: ethmonitor_controller_service_pb.TxTraverseStartMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxTraverseStart(request: ethmonitor_controller_service_pb.TxTraverseStartMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxStateChangeMsg(request: ethmonitor_controller_service_pb.TxStateChangeMsg, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxStateChangeMsg(request: ethmonitor_controller_service_pb.TxStateChangeMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public notifyTxStateChangeMsg(request: ethmonitor_controller_service_pb.TxStateChangeMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public askForNextState(request: ethmonitor_controller_service_pb.TxStateControlMsg, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    public askForNextState(request: ethmonitor_controller_service_pb.TxStateControlMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    public askForNextState(request: ethmonitor_controller_service_pb.TxStateControlMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.TxStateControlMsg) => void): grpc.ClientUnaryCall;
    public selectTx(request: ethmonitor_controller_service_pb.SelectTxControlMsg, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
    public selectTx(request: ethmonitor_controller_service_pb.SelectTxControlMsg, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
    public selectTx(request: ethmonitor_controller_service_pb.SelectTxControlMsg, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ethmonitor_controller_service_pb.SelectTxControlMsg) => void): grpc.ClientUnaryCall;
}
