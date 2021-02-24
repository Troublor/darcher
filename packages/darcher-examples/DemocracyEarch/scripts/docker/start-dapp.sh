#!/bin/bash

cd /sovereign || exit
meteor npm install
METEOR_MONGO_BIND_IP=0.0.0.0 exec meteor --settings=config/development/settings.json
