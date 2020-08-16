#!/usr/bin/env bash

PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
GRPC_TOOLS_NODE_PROTOC_PLUGIN="./node_modules/.bin/grpc_tools_node_protoc_plugin"
GRPC_TOOLS_NODE_PROTOC="./node_modules/.bin/grpc_tools_node_protoc"

f="../messages"
out="src/dArcher/grpc"
${GRPC_TOOLS_NODE_PROTOC} \
      --js_out=import_style=commonjs,binary:"${out}" \
      --grpc_out="${out}" \
      --plugin=protoc-gen-grpc="${GRPC_TOOLS_NODE_PROTOC_PLUGIN}" \
      -I "${f}" \
      "${f}"/common.proto "${f}"/dArcher.proto

${GRPC_TOOLS_NODE_PROTOC} \
    --plugin=protoc-gen-ts="${PROTOC_GEN_TS_PATH}" \
    --ts_out="${out}" \
    -I "${f}" \
    "${f}"/common.proto "${f}"/dArcher.proto