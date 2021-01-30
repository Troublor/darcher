#!/bin/bash

# meteor just won't work in docker, rubbish

DIR=$(dirname "${BASH_SOURCE[0]}")

cd "$DIR/../publicvotes/app" || exit
exec npm run start
