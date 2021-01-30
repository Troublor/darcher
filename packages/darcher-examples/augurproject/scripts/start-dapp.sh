#!/usr/bin/env bash

# there is some problem to start augur dapp in docker, so we make a separate shell script here to start augur dapp

cd ../augur || exit
yarn
yarn build
exec yarn ui dev
