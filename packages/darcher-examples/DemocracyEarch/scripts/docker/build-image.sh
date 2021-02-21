#!/bin/bash

DIR=$( dirname "${BASH_SOURCE[0]}" )

IMAGE_NAME=darcherframework/democracy-earth:latest

#docker build -t $IMAGE_NAME -f "$DIR"/Dockerfile "$DIR"/../..

DAPP_IMAGE_NAME=darcherframework/democracy-earth-dapp:latest

docker build -t $DAPP_IMAGE_NAME -f "$DIR"/dapp.Dockerfile "$DIR"/../..
