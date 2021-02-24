#!/bin/bash

export LC_ALL=en_US.UTF-8
cd /publicvotes || exit
METEOR_MONGO_BIND_IP=0.0.0.0 exec meteor
