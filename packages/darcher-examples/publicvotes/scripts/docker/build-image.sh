#!/bin/bash

DIR=$( dirname "${BASH_SOURCE[0]}" )

DAPP_IMAGE_NAME=darcherframework/publicvotes-dapp:latest

docker build -t $DAPP_IMAGE_NAME -f "$DIR"/Dockerfile "$DIR"/../..
