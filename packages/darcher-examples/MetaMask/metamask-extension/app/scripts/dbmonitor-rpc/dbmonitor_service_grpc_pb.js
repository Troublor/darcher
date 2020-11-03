// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var dbmonitor_service_pb = require('./dbmonitor_service_pb.js');
var common_pb = require('./common_pb.js');

function serialize_darcher_GetAllDataControlMsg(arg) {
  if (!(arg instanceof dbmonitor_service_pb.GetAllDataControlMsg)) {
    throw new Error('Expected argument of type darcher.GetAllDataControlMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_GetAllDataControlMsg(buffer_arg) {
  return dbmonitor_service_pb.GetAllDataControlMsg.deserializeBinary(new Uint8Array(buffer_arg));
}


var DBMonitorServiceService = exports.DBMonitorServiceService = {
  getAllDataControl: {
    path: '/darcher.DBMonitorService/getAllDataControl',
    requestStream: true,
    responseStream: true,
    requestType: dbmonitor_service_pb.GetAllDataControlMsg,
    responseType: dbmonitor_service_pb.GetAllDataControlMsg,
    requestSerialize: serialize_darcher_GetAllDataControlMsg,
    requestDeserialize: deserialize_darcher_GetAllDataControlMsg,
    responseSerialize: serialize_darcher_GetAllDataControlMsg,
    responseDeserialize: deserialize_darcher_GetAllDataControlMsg,
  },
};

exports.DBMonitorServiceClient = grpc.makeGenericClientConstructor(DBMonitorServiceService);
