// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var ethmonitor_controller_service_pb = require('./ethmonitor_controller_service_pb.js');
var common_pb = require('./common_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_darcher_SelectTxControlMsg(arg) {
  if (!(arg instanceof ethmonitor_controller_service_pb.SelectTxControlMsg)) {
    throw new Error('Expected argument of type darcher.SelectTxControlMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_SelectTxControlMsg(buffer_arg) {
  return ethmonitor_controller_service_pb.SelectTxControlMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_TxFinishedMsg(arg) {
  if (!(arg instanceof ethmonitor_controller_service_pb.TxFinishedMsg)) {
    throw new Error('Expected argument of type darcher.TxFinishedMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_TxFinishedMsg(buffer_arg) {
  return ethmonitor_controller_service_pb.TxFinishedMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_TxReceivedMsg(arg) {
  if (!(arg instanceof ethmonitor_controller_service_pb.TxReceivedMsg)) {
    throw new Error('Expected argument of type darcher.TxReceivedMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_TxReceivedMsg(buffer_arg) {
  return ethmonitor_controller_service_pb.TxReceivedMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_TxStateChangeMsg(arg) {
  if (!(arg instanceof ethmonitor_controller_service_pb.TxStateChangeMsg)) {
    throw new Error('Expected argument of type darcher.TxStateChangeMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_TxStateChangeMsg(buffer_arg) {
  return ethmonitor_controller_service_pb.TxStateChangeMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_TxStateControlMsg(arg) {
  if (!(arg instanceof ethmonitor_controller_service_pb.TxStateControlMsg)) {
    throw new Error('Expected argument of type darcher.TxStateControlMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_TxStateControlMsg(buffer_arg) {
  return ethmonitor_controller_service_pb.TxStateControlMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_TxTraverseStartMsg(arg) {
  if (!(arg instanceof ethmonitor_controller_service_pb.TxTraverseStartMsg)) {
    throw new Error('Expected argument of type darcher.TxTraverseStartMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_TxTraverseStartMsg(buffer_arg) {
  return ethmonitor_controller_service_pb.TxTraverseStartMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


var EthmonitorControllerServiceService = exports.EthmonitorControllerServiceService = {
  notifyTxReceived: {
    path: '/darcher.EthmonitorControllerService/notifyTxReceived',
    requestStream: false,
    responseStream: false,
    requestType: ethmonitor_controller_service_pb.TxReceivedMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_TxReceivedMsg,
    requestDeserialize: deserialize_darcher_TxReceivedMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  notifyTxFinished: {
    path: '/darcher.EthmonitorControllerService/notifyTxFinished',
    requestStream: false,
    responseStream: false,
    requestType: ethmonitor_controller_service_pb.TxFinishedMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_TxFinishedMsg,
    requestDeserialize: deserialize_darcher_TxFinishedMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  notifyTxTraverseStart: {
    path: '/darcher.EthmonitorControllerService/notifyTxTraverseStart',
    requestStream: false,
    responseStream: false,
    requestType: ethmonitor_controller_service_pb.TxTraverseStartMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_TxTraverseStartMsg,
    requestDeserialize: deserialize_darcher_TxTraverseStartMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  notifyTxStateChangeMsg: {
    path: '/darcher.EthmonitorControllerService/notifyTxStateChangeMsg',
    requestStream: false,
    responseStream: false,
    requestType: ethmonitor_controller_service_pb.TxStateChangeMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_TxStateChangeMsg,
    requestDeserialize: deserialize_darcher_TxStateChangeMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  askForNextState: {
    path: '/darcher.EthmonitorControllerService/askForNextState',
    requestStream: false,
    responseStream: false,
    requestType: ethmonitor_controller_service_pb.TxStateControlMsg,
    responseType: ethmonitor_controller_service_pb.TxStateControlMsg,
    requestSerialize: serialize_darcher_TxStateControlMsg,
    requestDeserialize: deserialize_darcher_TxStateControlMsg,
    responseSerialize: serialize_darcher_TxStateControlMsg,
    responseDeserialize: deserialize_darcher_TxStateControlMsg,
  },
  selectTx: {
    path: '/darcher.EthmonitorControllerService/selectTx',
    requestStream: false,
    responseStream: false,
    requestType: ethmonitor_controller_service_pb.SelectTxControlMsg,
    responseType: ethmonitor_controller_service_pb.SelectTxControlMsg,
    requestSerialize: serialize_darcher_SelectTxControlMsg,
    requestDeserialize: deserialize_darcher_SelectTxControlMsg,
    responseSerialize: serialize_darcher_SelectTxControlMsg,
    responseDeserialize: deserialize_darcher_SelectTxControlMsg,
  },
};

exports.EthmonitorControllerServiceClient = grpc.makeGenericClientConstructor(EthmonitorControllerServiceService);
