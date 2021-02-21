#!/bin/bash

cd /burner-wallet || exit
npm i
exec npm run start-local
