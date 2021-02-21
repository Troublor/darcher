#!/bin/bash

source ./env.sh

exec $GETH --datadir $BLOCKCHAIN_DIR/doer \
      --networkid 2020 \
      --nodiscover \
      --nousb \
      --ipcdisable \
      --port 30303 \
      --http --http.api web3,miner,admin,eth,txpool,net --http.addr 0.0.0.0 --http.port 8545 --http.corsdomain="*" --http.vhosts '*' \
      --ws --ws.addr 0.0.0.0 --wsport 8546 --wsorigins "*" \
      --syncmode full \
      --graphql \
      --keystore $BLOCKCHAIN_DIR/keystore \
      --unlock 0x6463f93d65391a8b7c98f0fc8439efd5d38339d9,0xba394b1eafcbbce84939103e2f443b80111be596 \
      --password $BLOCKCHAIN_DIR/keystore/passwords.txt \
      --allow-insecure-unlock \
      --ethmonitor.address "${ETHMONITOR_ADDR}" \
      --verbosity "${VERBOSITY}" \
