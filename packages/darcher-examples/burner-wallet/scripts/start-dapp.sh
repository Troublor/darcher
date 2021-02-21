#!/bin/bash

DIR=$(dirname "${BASH_SOURCE[0]}")

cd $DIR/../burner-wallet
exec npm run start-local
