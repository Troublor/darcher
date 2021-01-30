#!/bin/bash

DIR=$(dirname "${BASH_SOURCE[0]}")

cd "$DIR"/../heiswap || exit
exec yarn start
