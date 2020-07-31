## Darcher Project

Detecting bugs induced by DApp-blockchain interaction in decentralized applications (DApp). 

## Prerequisites

`node 10.x`

`yarn >= 1.22`

### Usage

First of all, install dependencies.
```
yarn
```

#### Start MockDarcherServer

```
yarn workspace @darcher/analyzer start:MockDarcherServer
```
This script will start MockDarcherServer with gRPC port on `localhost:1234`. 