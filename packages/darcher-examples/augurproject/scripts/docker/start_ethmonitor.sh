#!/bin/bash

source ./env.sh

$ETHMONITOR --ethmonitor.port "${ETHMONITOR_PORT}" \
            --ethmonitor.controller "${ETHMONITOR_CONTROLLER}" \
            --analyzer.address "${ANALYZER_ADDR}" \
            --verbosity "${VERBOSITY}" \