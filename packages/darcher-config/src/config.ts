export enum ControllerOptions {
    console = "console",
    trivial = "trivial",
    darcher = "darcher",
}

export interface Cluster {
    ethmonitorPort: number
    controller: ControllerOptions
    genesisFile: string
    dir: string
    keyStoreDir: string
    networkId?: number
    httpPort?: number
    wsPort?: number
    graphqlPort?: number
    extra?: string
}

export interface Darcher {
    grpcPort: number,
    wsPort: number,
}

export enum DBOptions {
    indexedDB = "indexedDB",
    mongoDB = "mongoDB",
}

export interface DBMonitor {
    db: DBOptions
    dbName: string
    dbAddress: string
}

export interface Config {
    darcher: Darcher
    clusters: Cluster[]
    dbMonitor: DBMonitor
}

const config = {
    "rpcPort": {
        "darcher-dbmonitor": {
            "ws": 1237,
        },
        "darcher-ethmonitor": 1236,
    },
    "dapp": {
        "address": "localhost:63342",
        "dbName": "friend_database",
    },
    "clusters": [
        <Cluster>{
            ethmonitorPort: 8989,
            controller: ControllerOptions.console,
            genesisFile: "/Users/troublor/workspace/dArcher/augur/blockchain/v1/genesis.json",
            dir: "/Users/troublor/workspace/dArcher/augur/blockchain/v1",
            keyStoreDir: "/Users/troublor/workspace/dArcher/augur/blockchain/v1/keystore",
            networkId: 123456,
            httpPort: 8545,
            wsPort: 8546,
            graphqlPort: 8547,
            extra: "",
        }
    ]
}
export default config;