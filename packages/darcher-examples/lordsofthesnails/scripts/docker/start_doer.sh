#!/bin/bash

source ./env.sh

exec $GETH --datadir $BLOCKCHAIN_DIR/doer \
      --networkid 2020 \
      --nodiscover \
      --nousb \
      --ipcdisable \
      --port 30303 \
      --http --http.api miner,admin,eth,txpool,net --http.addr 0.0.0.0 --http.port 8545 --http.corsdomain="*" --http.vhosts '*' \
      --ws --ws.addr 0.0.0.0 --wsport 8546 --wsorigins "*" \
      --syncmode full \
      --graphql \
      --keystore $BLOCKCHAIN_DIR/keystore \
      --unlock 0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb \
      --password $BLOCKCHAIN_DIR/keystore/password.txt \
      --allow-insecure-unlock \
      --ethmonitor.address "${ETHMONITOR_ADDR}" \
      --verbosity "${VERBOSITY}" \
