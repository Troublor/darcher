export enum ControllerOptions {
    console = "console",
    trivial = "trivial",
    darcher = "darcher",
    deploy = "deploy",
    traverse = "traverse",
}

export interface ClusterConfig {
    analyzerAddress?: string // address to the analyzer grpc endpoint
    ethmonitorPort: number
    controller: ControllerOptions
    genesisFile: string
    dir: string
    keyStoreDir: string
    networkId?: number
    httpPort?: number
    wsPort?: number
    graphql?: boolean
    verbosity?: number // go-ethereum verbosity level, default=3
    extra?: string
}

export interface AnalyzerConfig {
    grpcPort: number,
    wsPort: number,
    txStateChangeProcessTime?: number // in milliseconds
}

export enum DBOptions {
    indexedDB = "indexedDB",
    mongoDB = "mongoDB",
    extensionStorage = "extensionStorage",
    html = "html"
}

export interface DBMonitorConfig {
    db: DBOptions
    dbName: string
    dbAddress: string
    // only used in html mode DApp state
    elements?: { name: string, xpath: string }[]
    js?: string,
}

export interface Config {
    analyzer: AnalyzerConfig
    clusters: ClusterConfig[]
    dbMonitor: DBMonitorConfig
    logDir?: string,
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
        <ClusterConfig>{
            ethmonitorPort: 8989,
            controller: ControllerOptions.console,
            genesisFile: "/Users/troublor/workspace/dArcher/augur/blockchain/v1/genesis.json",
            dir: "/Users/troublor/workspace/dArcher/augur/blockchain/v1",
            keyStoreDir: "/Users/troublor/workspace/dArcher/augur/blockchain/v1/keystore",
            networkId: 123456,
            httpPort: 8545,
            wsPort: 8546,
            graphql: true,
            extra: "",
        }
    ]
}
export default config;
