#!/bin/bash

DIR=$( dirname "${BASH_SOURCE[0]}" )

IMAGE_NAME=darcherframework/ethereum_voting_dapp:latest

docker build -t $IMAGE_NAME -f "$DIR"/Dockerfile "$DIR"/../..
