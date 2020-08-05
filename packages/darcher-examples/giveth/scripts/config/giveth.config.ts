import {ClusterConfig, ControllerOptions, AnalyzerConfig, DBMonitorConfig, DBOptions} from "@darcher/config";
import * as path from "path";

const blockchainDir = path.join(__dirname, "..", "blockchain");

export const homeClusterConfig = <ClusterConfig>{
    ethmonitorPort: 8989,
    controller: ControllerOptions.deploy,
    genesisFile: path.join(blockchainDir, "home_network", "genesis.json"),
    dir: path.join(blockchainDir, "home_network"),
    keyStoreDir: path.join(blockchainDir, "home_network", "keystore"),
    networkId: 66,
    httpPort: 8545,
    wsPort: 9545,
    graphqlPort: 8547,
    extra: "",
    verbosity: 3,
};

export const foreignClusterConfig = <ClusterConfig>{
    ethmonitorPort: 8990,
    controller: ControllerOptions.deploy,
    genesisFile: path.join(blockchainDir, "foreign_network", "genesis.json"),
    dir: path.join(blockchainDir, "foreign_network"),
    keyStoreDir: path.join(blockchainDir, "foreign_network", "keystore"),
    networkId: 67,
    httpPort: 8546,
    wsPort: 9546,
    graphqlPort: 9547,
    extra: "",
    verbosity: 3,
};

export const dbMonitorConfig = <DBMonitorConfig>{
    db: DBOptions.indexedDB,
    dbName: "friend_database",
    dbAddress: "localhost:63342",
};

export const darcherConfig = <AnalyzerConfig>{
    grpcPort: 1236,
    wsPort: 1237,
};