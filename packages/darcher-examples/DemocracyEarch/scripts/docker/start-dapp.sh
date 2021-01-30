#!/bin/bash

cd /sovereign || exit
meteor npm install
exec meteor npm run start:dev
