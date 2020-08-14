import {ClusterConfig, Config, ControllerOptions} from "@darcher/config";
import * as path from "path";

export default <Config>{
    analyzer: {},
    dbMonitor: {},
    clusters: [
        <ClusterConfig>{
            analyzerAddress: "localhost:1234",
            ethmonitorPort: 8989,
            controller: ControllerOptions.trivial,
            genesisFile: path.join(__dirname, "..", "blockchain", "genesis.json"),
            dir: path.join(__dirname, "..", "blockchain"),
            keyStoreDir: path.join(__dirname, "..", "blockchain", "keystore"),
            networkId: 123456,
            httpPort: 8545,
            wsPort: 8546,
            graphql: true,
            extra: `--unlock 0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb,0x9d4c6d4b84cd046381923c9bc136d6ff1fe292d9,0xbd355a7e5a7adb23b51f54027e624bfe0e238df6 --password ${path.join(__dirname, "..", "blockchain", "keystore", "password.txt")} --allow-insecure-unlock`,
        }
    ]
}