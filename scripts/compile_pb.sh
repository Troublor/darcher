#!/usr/bin/env bash

MONOREPO_ROOT_DIR=.
PROTOBUF_DIR=${MONOREPO_ROOT_DIR}/darcher-rpc/src

# golang compilation
GOLANG_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/darcher-go-ethereum/ethmonitor/rpc
GOLANG_COMPILE_FILES=(
  "common.proto"
  "blockchain_status_service.proto"
  "p2p_network_service.proto"
  "mining_service.proto"
  "darcher_controller_service.proto"
)
echo -e golang compiled files:
COMPILE_TARGETS=""
for item in "${GOLANG_COMPILE_FILES[@]}"; do
  COMPILE_TARGETS="$COMPILE_TARGETS $PROTOBUF_DIR/$item"
  echo -e "$PROTOBUF_DIR/$item"
done
echo -e ""
protoc \
  --proto_path="${PROTOBUF_DIR}" \
  --go_out=Mgrpc/service_config/service_config.proto=/internal/proto/grpc_service_config:"${GOLANG_OUTPUT_DIR}" \
  --go-grpc_out=Mgrpc/service_config/service_config.proto=/internal/proto/grpc_service_config:"${GOLANG_OUTPUT_DIR}" \
  --go_opt=paths=source_relative \
  --go-grpc_opt=paths=source_relative \
  ${COMPILE_TARGETS}


# typescript compilation
TS_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/darcher-analyzer/src/rpc
TS_COMPILE_FILES=(
  "common.proto"
  "darcher_controller_service.proto"
)
echo -e golang compiled files:
COMPILE_TARGETS=""
for item in "${TS_COMPILE_FILES[@]}"; do
  COMPILE_TARGETS="$COMPILE_TARGETS $PROTOBUF_DIR/$item"
  echo -e "$PROTOBUF_DIR/$item"
done
echo -e ""

yarn run grpc_tools_node_protoc \
  --proto_path="${PROTOBUF_DIR}" \
  --js_out=import_style=commonjs,binary:${TS_OUTPUT_DIR} \
  --grpc_out=${TS_OUTPUT_DIR} \
  --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
  ${COMPILE_TARGETS}

# TypeScript code generation
yarn run grpc_tools_node_protoc \
  --proto_path="${PROTOBUF_DIR}" \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=${TS_OUTPUT_DIR} \
  ${COMPILE_TARGETS}

