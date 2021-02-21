// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var contract_oracle_service_pb = require('./contract_oracle_service_pb.js');
var common_pb = require('./common_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_darcher_GetReportsByContractControlMsg(arg) {
  if (!(arg instanceof contract_oracle_service_pb.GetReportsByContractControlMsg)) {
    throw new Error('Expected argument of type darcher.GetReportsByContractControlMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_GetReportsByContractControlMsg(buffer_arg) {
  return contract_oracle_service_pb.GetReportsByContractControlMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_GetReportsByTransactionControlMsg(arg) {
  if (!(arg instanceof contract_oracle_service_pb.GetReportsByTransactionControlMsg)) {
    throw new Error('Expected argument of type darcher.GetReportsByTransactionControlMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_GetReportsByTransactionControlMsg(buffer_arg) {
  return contract_oracle_service_pb.GetReportsByTransactionControlMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_darcher_TxErrorMsg(arg) {
  if (!(arg instanceof common_pb.TxErrorMsg)) {
    throw new Error('Expected argument of type darcher.TxErrorMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_darcher_TxErrorMsg(buffer_arg) {
  return common_pb.TxErrorMsg.deserializeBinary(new Uint8Array(buffer_arg));
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


var ContractVulnerabilityServiceService = exports.ContractVulnerabilityServiceService = {
  getReportsByContractControl: {
    path: '/darcher.ContractVulnerabilityService/getReportsByContractControl',
    requestStream: true,
    responseStream: true,
    requestType: contract_oracle_service_pb.GetReportsByContractControlMsg,
    responseType: contract_oracle_service_pb.GetReportsByContractControlMsg,
    requestSerialize: serialize_darcher_GetReportsByContractControlMsg,
    requestDeserialize: deserialize_darcher_GetReportsByContractControlMsg,
    responseSerialize: serialize_darcher_GetReportsByContractControlMsg,
    responseDeserialize: deserialize_darcher_GetReportsByContractControlMsg,
  },
  // reverse rpc (call from ethmonitor master to worker)
getReportsByTransactionControl: {
    path: '/darcher.ContractVulnerabilityService/getReportsByTransactionControl',
    requestStream: true,
    responseStream: true,
    requestType: contract_oracle_service_pb.GetReportsByTransactionControlMsg,
    responseType: contract_oracle_service_pb.GetReportsByTransactionControlMsg,
    requestSerialize: serialize_darcher_GetReportsByTransactionControlMsg,
    requestDeserialize: deserialize_darcher_GetReportsByTransactionControlMsg,
    responseSerialize: serialize_darcher_GetReportsByTransactionControlMsg,
    responseDeserialize: deserialize_darcher_GetReportsByTransactionControlMsg,
  },
  // reverse rpc (call from ethmonitor master to worker)
// actively notify tx error to ethmonitor
notifyTxError: {
    path: '/darcher.ContractVulnerabilityService/notifyTxError',
    requestStream: false,
    responseStream: false,
    requestType: common_pb.TxErrorMsg,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_darcher_TxErrorMsg,
    requestDeserialize: deserialize_darcher_TxErrorMsg,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
};

exports.ContractVulnerabilityServiceClient = grpc.makeGenericClientConstructor(ContractVulnerabilityServiceService);
