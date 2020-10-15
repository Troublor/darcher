import * as path from "path";
import {AnalyzerConfig, ClusterConfig, Config, ControllerOptions, DBMonitorConfig, DBOptions} from "@darcher/config";

const blockchainDir = path.join(__dirname, "..", "..", "blockchain");

export const clusterConfig: ClusterConfig = {
    analyzerAddress: "localhost:1234",
    controller: ControllerOptions.darcher,
    dir: blockchainDir,
    ethmonitorPort: 8989,
    extra: "",
    genesisFile: path.join(blockchainDir, "genesis.json"),
    graphql: true,
    httpPort: 8545,
    keyStoreDir: path.join(blockchainDir, "keystore"),
    networkId: 2020,
    verbosity: 3,
    wsPort: 8546
}

export const dbMonitorConfig = <DBMonitorConfig>{
    db: DBOptions.extensionStorage,
    dbName: "",
    dbAddress: "",
};

export const darcherConfig = <AnalyzerConfig>{
    grpcPort: 1234,
    wsPort: 1235,
};

export default <Config>{
    analyzer: darcherConfig,
    dbMonitor: dbMonitorConfig,
    clusters: [
        clusterConfig,
    ]
}
