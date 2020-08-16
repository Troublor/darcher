import {ClusterConfig, Config, ControllerOptions} from "@darcher/config";
import * as path from "path";

export default <Config>{
    analyzer: {},
    dbMonitor: {},
    clusters: [
        <ClusterConfig>{
            analyzerAddress: undefined, // address to the analyzer grpc endpoint
            ethmonitorPort: 8989,
            controller: ControllerOptions.trivial,
            genesisFile: path.join(__dirname, "..", "blockchain", "genesis.json"),
            dir: path.join(__dirname, "..", "blockchain"),
            keyStoreDir: path.join(__dirname, "..", "blockchain", "keystore"),
            networkId: 2020,
            httpPort: 8545,
            wsPort: 8546,
            graphql: true,
            verbosity: 3, // go-ethereum verbosity level, default=3
        }
    ]
}