#!/bin/bash

DIR=$(dirname "${BASH_SOURCE[0]}")
BASE_DIR=$DIR/../..
GETH=$BASE_DIR/../../darcher-go-ethereum/build/bin/geth

# initial blockchain
rm -rf "$BASE_DIR"/blockchain/foreign_network/doer "$BASE_DIR"/blockchain/foreign_network/talker
$GETH --datadir "$BASE_DIR"/blockchain/foreign_network/doer init "$BASE_DIR"/blockchain/foreign_network/genesis.json
$GETH --datadir "$BASE_DIR"/blockchain/foreign_network/talker init "$BASE_DIR"/blockchain/foreign_network/genesis.json
rm -rf "$BASE_DIR"/blockchain/home_network/doer "$BASE_DIR"/blockchain/home_network/talker
$GETH --datadir "$BASE_DIR"/blockchain/home_network/doer init "$BASE_DIR"/blockchain/home_network/genesis.json
$GETH --datadir "$BASE_DIR"/blockchain/home_network/talker init "$BASE_DIR"/blockchain/home_network/genesis.json

case "$(uname -s)" in
Linux*) ETHASH=~/.ethash ;;
Darwin*) ETHASH=~/Library/Ethash ;;
CYGWIN*) ;;
*) ;;
esac

# docker compose cluster in deploy mode
FOREIGN_BLOCKCHAIN_DIR=$BASE_DIR/blockchain/foreign_network \
  HOME_BLOCKCHAIN_DIR=$BASE_DIR/blockchain/home_network \
  ETHASH=$ETHASH \
  docker-compose -f "$DIR"/docker-compose.yml up -d

# deploy contracts
cd "$BASE_DIR"/feathers-giveth || exit
npm i
yarn deploy-local

sleep 3s

# stop docker
docker-compose -f "$DIR"/docker-compose.yml down

# reset privileges
sudo chown -R "$(whoami)":"$(whoami)" "$BASE_DIR"/blockchain
