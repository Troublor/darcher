#!/usr/bin/env bash

# make sure current directory is darcher-examples/react-ethereum-metacoin/scripts
export GETH=/usr/local/bin/geth
export ETHMONITOR=/usr/local/bin/ethmonitor
export BLOCKCHAIN_DIR=/blockchain

if [[ -z $VERBOSITY ]]; then
  export VERBOSITY=3
fi

if [[ -z $ETHMONITOR_PORT ]]; then
  export ETHMONITOR_PORT=8989
fi

if [[ -z $ETHMONITOR_ADDR ]]; then
  export ETHMONITOR_ADDR="localhost:8989"
fi

if [[ -z $ETHMONITOR_CONTROLLER ]]; then
  export ETHMONITOR_CONTROLLER="trivial"
fi

if [[ -z $ANALYZER_ADDR ]]; then
  export ANALYZER_ADDR="localhost:1234"
fi

if [[ -z $PORT ]]; then
  export PORT=30303
fi
