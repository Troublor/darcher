#!/bin/bash

DIR=$( dirname "${BASH_SOURCE[0]}" )

IMAGE_NAME=darcherframework/augur:latest
DAPP_IMAGE_NAME=darcherframework/augur-dapp:latest

#docker build -t $IMAGE_NAME -f "$DIR"/Dockerfile "$DIR"/../..
docker build -t $DAPP_IMAGE_NAME -f "$DIR"/dapp.Dockerfile "$DIR"/../..
