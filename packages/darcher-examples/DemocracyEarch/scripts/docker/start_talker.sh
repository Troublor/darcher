#!/bin/bash

source ./env.sh

exec $GETH --datadir $BLOCKCHAIN_DIR/talker \
      --networkid 2020 \
      --nodiscover \
      --nousb \
      --ipcdisable \
      --port 30304 \
      --syncmode full \
      --keystore $BLOCKCHAIN_DIR/keystore \
      --ethmonitor.address "${ETHMONITOR_ADDR}" \
      --verbosity "${VERBOSITY}" \
      --ethmonitor.talker \
