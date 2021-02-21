#!/bin/bash

DIR=$( dirname "${BASH_SOURCE[0]}" )

FOREIGN_IMAGE_NAME=darcherframework/giveth-foreign:latest

docker build -t $FOREIGN_IMAGE_NAME -f "$DIR"/foreign.Dockerfile "$DIR"/../..

HOME_IMAGE_NAME=darcherframework/giveth-home:latest

docker build -t $HOME_IMAGE_NAME -f "$DIR"/home.Dockerfile "$DIR"/../..

DAPP_IMAGE_NAME=darcherframework/giveth-dapp:latest

docker build -t $DAPP_IMAGE_NAME -f "$DIR"/dapp.Dockerfile "$DIR"/../..
