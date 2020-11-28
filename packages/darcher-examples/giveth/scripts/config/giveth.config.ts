import {ClusterConfig, ControllerOptions, AnalyzerConfig, DBMonitorConfig, DBOptions, Config} from "@darcher/config";
import * as path from "path";

const blockchainDir = path.join(__dirname, "..", "blockchain");

export const homeClusterConfig = <ClusterConfig>{
    ethmonitorPort: 8989,
    controller: ControllerOptions.darcher,
    genesisFile: path.join(blockchainDir, "home_network", "genesis.json"),
    dir: path.join(blockchainDir, "home_network"),
    keyStoreDir: path.join(blockchainDir, "home_network", "keystore"),
    networkId: 66,
    httpPort: 8545,
    wsPort: 9545,
    graphql: true,
    extra: "",
    verbosity: 3,
};

export const foreignClusterConfig = <ClusterConfig>{
    ethmonitorPort: 8990,
    controller: ControllerOptions.darcher,
    genesisFile: path.join(blockchainDir, "foreign_network", "genesis.json"),
    dir: path.join(blockchainDir, "foreign_network"),
    keyStoreDir: path.join(blockchainDir, "foreign_network", "keystore"),
    networkId: 67,
    httpPort: 8546,
    wsPort: 9546,
    graphql: true,
    extra: "",
    verbosity: 3,
};

export const dbMonitorConfig = <DBMonitorConfig>{
    db: DBOptions.mongoDB,
    dbName: "giveth",
    dbAddress: "mongodb://localhost:27017",
};

export const darcherConfig = <AnalyzerConfig>{
    grpcPort: 1234,
    wsPort: 1235,
};

export default <Config>{
    analyzer: darcherConfig,
    dbMonitor: dbMonitorConfig,
    clusters: [
        foreignClusterConfig,
        homeClusterConfig,
    ],
    logDir: path.join(__dirname, "..", "..", "data", `${(() => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}=${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    })()}`)
}
