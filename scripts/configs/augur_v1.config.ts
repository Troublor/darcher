import {ClusterConfig, Config, ControllerOptions, AnalyzerConfig, DBMonitorConfig, DBOptions} from "@darcher/config";

export default <Config>{
    analyzer: <AnalyzerConfig>{
        grpcPort: 1236,
        wsPort: 1237,
    },
    dbMonitor: <DBMonitorConfig>{
        db: DBOptions.indexedDB,
        dbName: "friend_database",
        dbAddress: "localhost:63342",
    },
    clusters: [
        <ClusterConfig>{
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