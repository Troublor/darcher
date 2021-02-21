#!/bin/bash

DIR=$( dirname "${BASH_SOURCE[0]}" )

IMAGE_NAME=darcherframework/ethereum-todolist:latest

docker build -t $IMAGE_NAME -f "$DIR"/Dockerfile "$DIR"/../..
