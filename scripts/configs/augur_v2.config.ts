import {ClusterConfig, Config, ControllerOptions, AnalyzerConfig, DBMonitorConfig, DBOptions} from "@darcher/config";

export default <Config>{
    analyzer: <AnalyzerConfig>{
        grpcPort: 1236,
        wsPort: 1237,
    },
    dbMonitor: <DBMonitorConfig>{
        db: DBOptions.indexedDB,
        dbName: "augur-123456",
        dbAddress: "localhost:8080",
    },
    clusters: [
        <ClusterConfig>{
            ethmonitorPort: 8989,
            controller: ControllerOptions.darcher,
            genesisFile: "/Users/troublor/workspace/dArcher/augur/blockchain/v2/genesis.json",
            dir: "/Users/troublor/workspace/dArcher/augur/blockchain/v2",
            keyStoreDir: "/Users/troublor/workspace/dArcher/augur/blockchain/v2/keystore",
            networkId: 123456,
            httpPort: 8545,
            wsPort: 8546,
            graphqlPort: 8547,
            extra: "--unlock \"0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb,0x9d4c6d4b84cd046381923c9bc136d6ff1fe292d9,0xbd355a7e5a7adb23b51f54027e624bfe0e238df6,0x2ecB718297080fF730269176E42C8278aA193434\" --password /Users/troublor/workspace/dArcher/augur/blockchain/v2/keystore/password.txt --allow-insecure-unlock",
        }
    ]
}