#!/bin/bash

source ./env.sh

exec $GETH --datadir $FOREIGN_BLOCKCHAIN_DIR/doer \
      --networkid 67 \
      --nodiscover \
      --nousb \
      --ipcdisable \
      --port 30303 \
      --http --http.api miner,admin,eth,txpool,net --http.addr 0.0.0.0 --http.port 8545 --http.corsdomain="*" --http.vhosts '*' \
      --ws --ws.addr 0.0.0.0 --wsport 8546 --wsorigins "*" \
      --syncmode full \
      --graphql \
      --keystore $FOREIGN_BLOCKCHAIN_DIR/keystore \
      --allow-insecure-unlock \
      --ethmonitor.address "${ETHMONITOR_ADDR}" \
      --verbosity "${VERBOSITY}" \
