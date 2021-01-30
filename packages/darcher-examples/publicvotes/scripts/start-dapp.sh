#!/bin/bash

# meteor just won't work in docker, rubbish

DIR=$(dirname "${BASH_SOURCE[0]}")

cd "$DIR/../publicvotes/app" || exit
meteor reset
exec npm run start
