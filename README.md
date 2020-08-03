## Darcher Project

Detecting bugs induced by DApp-blockchain interaction in decentralized applications (DApp). 

## Prerequisites

`node 10.x`

`yarn >= 1.22`

## Install Dependencies

```
yarn
```

### For Debugging

#### MockDarcherServer

```
yarn workspace @darcher/analyzer start:MockDarcherServer
```
This script will start MockDarcherServer with gRPC port on `localhost:1234`. `Ctrl-C` will stop the MockDarcherServer.

### Examples: Augur

First, make sure Augur submodule (`packages/darcher-examples/augurproject/augur`) has been cloned, then install dependencies for Augur submodule.

```shell script
cd packages/darcher-examples/augurproject/augur && yarn
cd ../../../../  # go back to darcher root dir
```

#### Prepare Augur

```shell script
yarn workspace @darcher/examples docker:build:augur-blockchain
```

This script will run for about 10 minutes, initiating a new blockchain and deploy Augur smart contracts. After that, the blockchain will be used to create a docker image tagged `darcher/augur-base:latest`.

#### Start Augur Service

```shell script
yarn workspace @darcher/examples start:augur-docker
```

This script does the following things:
- Start blockchain cluster docker container using the image built in `Prepare Augur` above.
- Start `gsn-relay` service.
- Start `@augur/ui` server. 

A **new terminal window** with two tabs will be opened, one is `gsn-relay` service while the other is `@augur/ui`.

To stop the service, just use `Ctrl-C` to interrupt the two opened tabs and use this script to stop docker containers:
```shell script
yarn workspace @darcher/examples docker:stop:augur-blockchain
```