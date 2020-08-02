/*
This script start augur blockchain locally without docker
 */

import {BlockchainCluster} from "@darcher/helpers";
import {ClusterConfig, Config, ControllerOptions} from "@darcher/config";
import * as path from "path";

const config = <Config>{
    analyzer: {},
    dbMonitor: {},
    clusters: [
        <ClusterConfig>{
            analyzerAddress: "localhost:1234",
            ethmonitorPort: 8989,
            controller: ControllerOptions.trivial,
            genesisFile: path.join(__dirname, "blockchain", "genesis.json"),
            dir: path.join(__dirname, "blockchain"),
            keyStoreDir: path.join(__dirname, "blockchain", "keystore"),
            networkId: 2020,
            httpPort: 8545,
            wsPort: 8546,
            graphqlPort: 8547,
            extra: "--unlock \"0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb,0x9d4c6d4b84cd046381923c9bc136d6ff1fe292d9,0xbd355a7e5a7adb23b51f54027e624bfe0e238df6,0x2ecB718297080fF730269176E42C8278aA193434\" --password /Users/troublor/workspace/dArcher/augur/blockchain/v2/keystore/password.txt --allow-insecure-unlock",
        }
    ]
}

async function main(){
    let cluster = new BlockchainCluster(config.clusters[0]);
    // start cluster in terminal window
    await cluster.start();
}

main().then(()=>{
    console.log("Augur blockchain started")
})
