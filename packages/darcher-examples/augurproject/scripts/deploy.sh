#!/bin/bash

source ./env.sh

function reset_blockchain() {
  echo -e "Resetting blockchain at ${BLOCKCHAIN_DIR}"
  rm -rf "$BLOCKCHAIN_DIR/doer/geth" "$BLOCKCHAIN_DIR/doer/history" "$BLOCKCHAIN_DIR/talker/geth" "$BLOCKCHAIN_DIR/talker/history"
  $GETH --datadir "$BLOCKCHAIN_DIR/doer" --nousb init "$BLOCKCHAIN_DIR/genesis.json"
  $GETH --datadir "$BLOCKCHAIN_DIR/talker" --nousb init "$BLOCKCHAIN_DIR/genesis.json"
  echo -e "Finish resetting blockchain"
}

function start_blockchain_deploy() {
  nohup $GETH --datadir $BLOCKCHAIN_DIR/doer \
    --networkid 2020 \
    --nodiscover \
    --ipcdisable \
    --port 30303 \
    --http --http.api eth,txpool,net --http.port 8545 --http.corsdomain="*" \
    --ws --wsport 8546 --wsorigins "*" \
    --syncmode full \
    --graphql --graphql.port 8547 \
    --keystore $BLOCKCHAIN_DIR/keystore \
    --unlock "0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb,0x9d4c6d4b84cd046381923c9bc136d6ff1fe292d9,0xbd355a7e5a7adb23b51f54027e624bfe0e238df6,0x2ecB718297080fF730269176E42C8278aA193434" \
    --password $BLOCKCHAIN_DIR/keystore/password.txt \
    --allow-insecure-unlock \
    --miner.mineWhenTx \
  &
}

function deploy_augur() {
  PWD=$(pwd)
  cd ../augur || exit
  yarn flash fake-all --parallel --createMarkets
  cd "$PWD" || exit
}

echo "Reset blockchain..."
reset_blockchain

echo "Start blockchain in the background..."
#./start_blockchain_deploy.sh
rm -rf nohup.out
start_blockchain_deploy
PID=$!
sleep 5

echo "Invoking augur deploy..."
deploy_augur
echo "Finish deploying augur"
echo "Blockchain data dir: $BLOCKCHAIN_DIR"

echo "Stopping blockchain..."
kill -INT $PID
