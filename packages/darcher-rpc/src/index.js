module.exports = Object.assign(
	require("./common_pb"),
	require("./common_grpc_pb"),
	require("./ethmonitor_controller_service_pb"),
	require("./ethmonitor_controller_service_grpc_pb"),
	require("./dbmonitor_service_pb"),
	require("./dbmonitor_service_grpc_pb"),
	require("./contract_oracle_service_pb"),
	require("./contract_oracle_service_grpc_pb"),
	require("./dapp_test_driver_service_pb"),
	require("./dapp_test_driver_service_grpc_pb"),
);
