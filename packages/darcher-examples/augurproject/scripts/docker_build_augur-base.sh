#!/bin/bash

IMAGE_TAG=darcher/augur-base

bash ./deploy.sh
docker build --no-cache -t $IMAGE_TAG -f ./docker/Dockerfile .
