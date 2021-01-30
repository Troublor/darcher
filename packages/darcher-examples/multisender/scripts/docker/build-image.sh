#!/bin/bash

DIR=$( dirname "${BASH_SOURCE[0]}" )

IMAGE_NAME=darcherframework/multisender:latest

docker build -t $IMAGE_NAME -f "$DIR"/Dockerfile "$DIR"/../..
