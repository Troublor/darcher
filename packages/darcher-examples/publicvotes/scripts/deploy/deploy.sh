#!/usr/bin/env bash

DIR=$(dirname "${BASH_SOURCE[0]}")
BASE_DIR=$DIR/../..
GETH=$BASE_DIR/../../darcher-go-ethereum/build/bin/geth

# initialize blockchain
rm -rf "$BASE_DIR"/blockchain/doer "$BASE_DIR"/blockchain/talker
$GETH --datadir "$BASE_DIR"/blockchain/doer init "$BASE_DIR"/blockchain/genesis.json
$GETH --datadir "$BASE_DIR"/blockchain/talker init "$BASE_DIR"/blockchain/genesis.json

case "$(uname -s)" in
    Linux*)     ETHASH=~/.ethash;;
    Darwin*)    ETHASH=~/Library/Ethash;;
    CYGWIN*)    ;;
    *)          ;;
esac

# docker compose cluster in deploy mode
BLOCKCHAIN_DIR=$BASE_DIR/blockchain ETHASH=$ETHASH docker-compose -f "$DIR"/docker-compose.yml up -d

# publicvotes does not need to deploy contracts
sleep 3s

# stop docker
docker-compose -f "$DIR"/docker-compose.yml down

# reset privileges
sudo chown -R "$(whoami)":"$(whoami)" "$BASE_DIR"/blockchain
