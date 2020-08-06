#!/bin/bash

source ./env.sh

exec $GETH --datadir $HOME_BLOCKCHAIN_DIR/talker \
      --networkid 66 \
      --nodiscover \
      --nousb \
      --ipcdisable \
      --port 30304 \
      --syncmode full \
      --keystore $HOME_BLOCKCHAIN_DIR/keystore \
      --allow-insecure-unlock \
      --ethmonitor.address "${ETHMONITOR_ADDR}" \
      --verbosity "${VERBOSITY}" \
      --ethmonitor.talker \
