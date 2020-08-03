#!/bin/bash

source ./env.sh

exec $GETH --datadir $BLOCKCHAIN_DIR/talker \
      --networkid 123456 \
      --nodiscover \
      --nousb \
      --ipcdisable \
      --port 30304 \
      --syncmode full \
      --keystore $BLOCKCHAIN_DIR/keystore \
      --unlock "0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb,0x9d4c6d4b84cd046381923c9bc136d6ff1fe292d9,0xbd355a7e5a7adb23b51f54027e624bfe0e238df6,0x2ecB718297080fF730269176E42C8278aA193434" \
      --password $BLOCKCHAIN_DIR/keystore/password.txt \
      --allow-insecure-unlock \
      --ethmonitor.address "${ETHMONITOR_ADDR}" \
      --verbosity "${VERBOSITY}" \
      --ethmonitor.talker \
