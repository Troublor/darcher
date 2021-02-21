#!/bin/bash

DIR=$(dirname "${BASH_SOURCE[0]}")
BASE_DIR=$DIR/../..
GETH=$BASE_DIR/../../darcher-go-ethereum/build/bin/geth

# initial blockchain
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

# deploy contracts
cd "$BASE_DIR"/multisender/oz || exit
npm i
oz deploy -k regular --no-interactive -n development UpgradebleStormSender
# contract address is deterministic 0x0DA18EBf3C1bA9c201B97693af91757040840664
# owner address is the same as deployer 0x6463f93d65391a8b7c98f0fc8439efd5d38339d9
oz send-tx --to 0x0DA18EBf3C1bA9c201B97693af91757040840664 --method initialize --args 0x6463f93d65391a8b7c98f0fc8439efd5d38339d9 -n development --no-interactive

# deploy WETH ERC20 token
cd "$BASE_DIR"/WETH || exit
truffle migrate --reset
# WETH contract address is deterministic 0x36DD38fD529a8A6a8d14331c4960884ac5b258AE

# stop docker
docker-compose -f "$DIR"/docker-compose.yml down

# reset privileges
sudo chown -R "$(whoami)":"$(whoami)" "$BASE_DIR"/blockchain
