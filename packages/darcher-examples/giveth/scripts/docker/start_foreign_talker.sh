#!/bin/bash

source ./env.sh

exec $GETH --datadir $FOREIGN_BLOCKCHAIN_DIR/talker \
      --networkid 67 \
      --nodiscover \
      --nousb \
      --ipcdisable \
      --port 30304 \
      --syncmode full \
      --keystore $FOREIGN_BLOCKCHAIN_DIR/keystore \
      --allow-insecure-unlock \
      --ethmonitor.address "${ETHMONITOR_ADDR}" \
      --verbosity "${VERBOSITY}" \
      --ethmonitor.talker \
