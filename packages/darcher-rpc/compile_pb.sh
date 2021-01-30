#!/usr/bin/env bash

MONOREPO_ROOT_DIR=../..
PROTOBUF_DIR=${MONOREPO_ROOT_DIR}/packages/darcher-rpc/proto

function compile_golang() {
  OUTPUT_DIR=$1
  echo -e "===golang compiled files:==="
  COMPILE_TARGETS=""
  for ((index = 2; index <= $#; ++index)); do
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
  for ((index = 2; index <= $#; ++index)); do
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

function compile_java() {
  # Java compilation
  OUTPUT_DIR=$1
  echo -e "===java compiled files:==="
  COMPILE_TARGETS=""
  for ((index = 2; index <= $#; ++index)); do
    COMPILE_TARGETS="$COMPILE_TARGETS $PROTOBUF_DIR/${!index}"
    echo -e "$PROTOBUF_DIR/${!index}"
  done
  echo -e "===java compilation output dir:==="
  echo -e ${OUTPUT_DIR}
  echo -e ""

  protoc \
    -I="${PROTOBUF_DIR}" \
    --java_out="${OUTPUT_DIR}" \
    ${COMPILE_TARGETS}

  protoc \
    --plugin=protoc-gen-grpc-java=./resources/protoc-gen-grpc-java \
    --grpc-java_out="${OUTPUT_DIR}" \
    --proto_path="$PROTOBUF_DIR" \
    ${COMPILE_TARGETS}
}

# darcher-go-ethereum golang compilation
GOLANG_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/packages/darcher-go-ethereum/ethmonitor/rpc
GOLANG_COMPILE_FILES=(
  "common.proto"
  "blockchain_status_service.proto"
  "p2p_network_service.proto"
  "mining_service.proto"
  "ethmonitor_controller_service.proto"
  "contract_oracle_service.proto"
)
# shellcheck disable=SC2068
compile_golang ${GOLANG_OUTPUT_DIR} ${GOLANG_COMPILE_FILES[@]}

# common typescript compilation (compiled to @darcher/rpc/src)
TS_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/packages/darcher-rpc/src
TS_COMPILE_FILES=(
  "common.proto"
  "ethmonitor_controller_service.proto"
  "dbmonitor_service.proto"
  "contract_oracle_service.proto"
  "dapp_test_service.proto"
)
# shellcheck disable=SC2068
compile_ts ${TS_OUTPUT_DIR} ${TS_COMPILE_FILES[@]}

# common java compilation (compiled to @darcher/crawljax/rpc)
JAVA_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/packages/darcher-crawljax/rpc/src/main/java
JAVA_COMPILE_FILES=(
  "common.proto"
  "dapp_test_service.proto"
)
# shellcheck disable=SC2068
compile_java ${JAVA_OUTPUT_DIR} ${JAVA_COMPILE_FILES[@]}

echo "" >./src/index.d.ts
echo -e "module.exports = Object.assign(" >./src/index.js
# shellcheck disable=SC2068
for item in ${TS_COMPILE_FILES[@]}; do
  moduleName=${item:0:${#item}-6}_pb
  if [[ -f "./src/$moduleName.js" ]]; then
    echo -e "\trequire(\"./$moduleName\")," >>./src/index.js
  fi
  if [[ -f "./src/$moduleName.d.ts" ]]; then
    echo -e "export * from \"./$moduleName\"" >>./src/index.d.ts
  fi
  moduleName=${item:0:${#item}-6}_grpc_pb
  if [[ -f "./src/$moduleName.js" ]]; then
    echo -e "\trequire(\"./$moduleName\")," >>./src/index.js
  fi
  if [[ -f "./src/$moduleName.d.ts" ]]; then
    echo -e "export * from \"./$moduleName\"" >>./src/index.d.ts
  fi
done
echo -e ");" >>./src/index.js

## darcher-dbmonitor-browser typescript compilation (compiled to @darcher/dbmonitor-browser/src/rpc), due to special usage in browser
TS_OUTPUT_DIR=${MONOREPO_ROOT_DIR}/packages/darcher-dbmonitor-browser/src/rpc
TS_COMPILE_FILES=(
  "common.proto"
  "dbmonitor_service.proto"
)
# shellcheck disable=SC2068
compile_ts ${TS_OUTPUT_DIR} ${TS_COMPILE_FILES[@]}
