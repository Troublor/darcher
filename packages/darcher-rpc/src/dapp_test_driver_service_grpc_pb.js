// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var dapp_test_driver_service_pb = require('./dapp_test_driver_service_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
var common_pb = require('./common_pb.js');

function serialize_darcher_ConsoleErrorMsg(arg) {
  if (!(arg instanceof dapp_test_driver_service_pb.ConsoleErrorMsg)) {
    throw new Error('Expected argument of type darcher.ConsoleErrorMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_ConsoleErrorMsg(buffer_arg) {
  return dapp_test_driver_service_pb.ConsoleErrorMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_DAppDriverControlMsg(arg) {
  if (!(arg instanceof dapp_test_driver_service_pb.DAppDriverControlMsg)) {
    throw new Error('Expected argument of type darcher.DAppDriverControlMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_DAppDriverControlMsg(buffer_arg) {
  return dapp_test_driver_service_pb.DAppDriverControlMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_TestStartMsg(arg) {
  if (!(arg instanceof dapp_test_driver_service_pb.TestStartMsg)) {
    throw new Error('Expected argument of type darcher.TestStartMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_TestStartMsg(buffer_arg) {
  return dapp_test_driver_service_pb.TestStartMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_TxMsg(arg) {
  if (!(arg instanceof dapp_test_driver_service_pb.TxMsg)) {
    throw new Error('Expected argument of type darcher.TxMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_TxMsg(buffer_arg) {
  return dapp_test_driver_service_pb.TxMsg.deserializeBinary(new Uint8Array(buffer_arg));
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


var DAppTestDriverServiceService = exports.DAppTestDriverServiceService = {
  // *
// DApp driver should call notifyTestStart() rpc once when test starts
notifyTestStart: {
    path: '/darcher.DAppTestDriverService/notifyTestStart',
    requestStream: false,
    responseStream: false,
    requestType: dapp_test_driver_service_pb.TestStartMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_TestStartMsg,
    requestDeserialize: deserialize_darcher_TestStartMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // *
// DApp driver should call notifyTestEnd() rpc once when test ends
notifyTestEnd: {
    path: '/darcher.DAppTestDriverService/notifyTestEnd',
    requestStream: false,
    responseStream: false,
    requestType: dapp_test_driver_service_pb.TestStartMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_TestStartMsg,
    requestDeserialize: deserialize_darcher_TestStartMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // *
// Each time DApp driver performs a `send transaction` operation, it should call waitForTxProcess() rpc immediately after transaction is send.
// This rpc call may block for arbitrary amount of time. DApp driver must wait for this rpc call to return.
waitForTxProcess: {
    path: '/darcher.DAppTestDriverService/waitForTxProcess',
    requestStream: false,
    responseStream: false,
    requestType: dapp_test_driver_service_pb.TxMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_TxMsg,
    requestDeserialize: deserialize_darcher_TxMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // *
// Reverse rpc to let darcher control dapp driver.
// Reverse rpc is implemented with bidirectional stream grpc, in order to make it possible to let server send rpc call to client.
// Client should first send an initial DAppDriverControlMsg to server and maintain the input/output stream and act as a logical rpc server.
// During the connection, server may send a DAppDriverControlMsg as request to client and client should respond with the same (role, id, dapp_name, instance_id)
dappDriverControl: {
    path: '/darcher.DAppTestDriverService/dappDriverControl',
    requestStream: true,
    responseStream: true,
    requestType: dapp_test_driver_service_pb.DAppDriverControlMsg,
    responseType: dapp_test_driver_service_pb.DAppDriverControlMsg,
    requestSerialize: serialize_darcher_DAppDriverControlMsg,
    requestDeserialize: deserialize_darcher_DAppDriverControlMsg,
    responseSerialize: serialize_darcher_DAppDriverControlMsg,
    responseDeserialize: deserialize_darcher_DAppDriverControlMsg,
  },
  // *
// DApp driver should call notifyConsoleError when there is an error in dapp console
notifyConsoleError: {
    path: '/darcher.DAppTestDriverService/notifyConsoleError',
    requestStream: false,
    responseStream: false,
    requestType: dapp_test_driver_service_pb.ConsoleErrorMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_ConsoleErrorMsg,
    requestDeserialize: deserialize_darcher_ConsoleErrorMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
};

exports.DAppTestDriverServiceClient = grpc.makeGenericClientConstructor(DAppTestDriverServiceService);
