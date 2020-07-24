import {ClusterConfig, Config, ControllerOptions, DarcherConfig, DBMonitorConfig, DBOptions} from "@darcher/config";

export default <Config>{
    darcher: <DarcherConfig>{
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
            controller: ControllerOptions.deploy,
            genesisFile: "/Users/troublor/workspace/dArcher/giveth/blockchain/home/genesis.json",
            dir: "/Users/troublor/workspace/dArcher/giveth/blockchain/home",
            keyStoreDir: "/Users/troublor/workspace/dArcher/giveth/blockchain/home/keystore",
            networkId: 66,
            httpPort: 8545,
            wsPort: 9545,
            graphqlPort: 8547,
            extra: "",
        },
        <ClusterConfig>{
            ethmonitorPort: 8990,
            controller: ControllerOptions.deploy,
            genesisFile: "/Users/troublor/workspace/dArcher/giveth/blockchain/foreign/genesis.json",
            dir: "/Users/troublor/workspace/dArcher/augur/blockchain/foreign",
            keyStoreDir: "/Users/troublor/workspace/dArcher/giveth/blockchain/foreign/keystore",
            networkId: 67,
            httpPort: 8546,
            wsPort: 9546,
            graphqlPort: 9547,
            extra: "",
        },
    ]
}