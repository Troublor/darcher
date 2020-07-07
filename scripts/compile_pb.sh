#!/usr/bin/env bash

MONOREPO_ROOT_DIR=.
PROTOBUF_DIR=${MONOREPO_ROOT_DIR}/darcher-rpc/src

function compile_golang() {
    OUTPUT_DIR=$1
    echo -e "===golang compiled files:==="
    COMPILE_TARGETS=""
    for (( index = 2; index <= $#; ++index )); do
        COMPILE_TARGETS="$COMPILE_TARGETS $PROTOBUF_DIR/${!index}"
        echo -e "$PROTOBUF_DIR/${!index}"
    done
    echo -e "===golang compilation output dir:==="
    echo -e ${OUTPUT_DIR}
    echo -e ""

    protoc \
      --proto_path="${PROTOBUF_DIR}" \
      --go_out=Mgrpc/service_config/service_config.proto=/internal/proto/grpc_service_config:"${OUTPUT_DIR}" \
      --go-grpc_out=Mgrpc/service_config/service_config.proto=/internal/proto/grpc_service_config:"${OUTPUT_DIR}" \
      --go_opt=paths=source_relative \
      --go-grpc_opt=paths=source_relative \
      ${COMPILE_TARGETS}
}

function compile_ts() {
    # typescript compilation
    OUTPUT_DIR=$1
    echo -e "===typescript compiled files:==="
    COMPILE_TARGETS=""
    for (( index = 2; index <= $#; ++index )); do
        COMPILE_TARGETS="$COMPILE_TARGETS $PROTOBUF_DIR/${!index}"
        echo -e "$PROTOBUF_DIR/${!index}"
    done
    echo -e "===typescript compilation output dir:==="
    echo -e ${OUTPUT_DIR}
    echo -e ""

    yarn run grpc_tools_node_protoc \
      --proto_path="${PROTOBUF_DIR}" \
      --js_out=import_style=commonjs,binary:${OUTPUT_DIR} \
      --grpc_out=${OUTPUT_DIR} \
      --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
      ${COMPILE_TARGETS}

    # TypeScript code generation
    yarn run grpc_tools_node_protoc \
      --proto_path="${PROTOBUF_DIR}" \
      --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
      --ts_out=${OUTPUT_DIR} \
      ${COMPILE_TARGETS}
}

# darcher-go-ethereum golang compilation
GOLANG_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/darcher-go-ethereum/ethmonitor/rpc
GOLANG_COMPILE_FILES=(
  "common.proto"
  "blockchain_status_service.proto"
  "p2p_network_service.proto"
  "mining_service.proto"
  "darcher_controller_service.proto"
)
compile_golang ${GOLANG_OUTPUT_DIR} ${GOLANG_COMPILE_FILES[@]}

# darcher-analyzer typescript compilation
TS_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/darcher-analyzer/src/rpc
TS_COMPILE_FILES=(
  "common.proto"
  "darcher_controller_service.proto"
  "dbmonitor_service.proto"
)
compile_ts ${TS_OUTPUT_DIR} ${TS_COMPILE_FILES[@]}

# darcher-dbmonitor-browser typescript compilation
#TS_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/darcher-dbmonitor-browser/src/rpc
#TS_COMPILE_FILES=(
#  "dbmonitor_service.proto"
#)
#compile_ts ${TS_OUTPUT_DIR} ${TS_COMPILE_FILES[@]}