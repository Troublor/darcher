// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var dbmonitor_service_pb = require('./dbmonitor_service_pb.js');
var common_pb = require('./common_pb.js');

function serialize_darcher_ControlMsg(arg) {
  if (!(arg instanceof dbmonitor_service_pb.ControlMsg)) {
    throw new Error('Expected argument of type darcher.ControlMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_ControlMsg(buffer_arg) {
  return dbmonitor_service_pb.ControlMsg.deserializeBinary(new Uint8Array(buffer_arg));
}


var DBMonitorServiceService = exports.DBMonitorServiceService = {
  getAllDataControl: {
    path: '/darcher.DBMonitorService/getAllDataControl',
    requestStream: true,
    responseStream: true,
    requestType: dbmonitor_service_pb.ControlMsg,
    responseType: dbmonitor_service_pb.ControlMsg,
    requestSerialize: serialize_darcher_ControlMsg,
    requestDeserialize: deserialize_darcher_ControlMsg,
    responseSerialize: serialize_darcher_ControlMsg,
    responseDeserialize: deserialize_darcher_ControlMsg,
  },
};

exports.DBMonitorServiceClient = grpc.makeGenericClientConstructor(DBMonitorServiceService);
