import {ClusterConfig, Config, ControllerOptions, DBOptions} from "@darcher/config";
import * as path from "path";

export default <Config>{
    analyzer: {
        grpcPort: 1234,
        wsPort: 1235,
    },
    dbMonitor: {
        db: DBOptions.indexedDB,
        dbName: "augur-123456",
        dbAddress: "http://localhost:8080",
    },
    clusters: [
        <ClusterConfig>{
            analyzerAddress: "localhost:1234",
            ethmonitorPort: 8989,
            controller: ControllerOptions.darcher,
            genesisFile: path.join(__dirname, "..", "blockchain", "genesis.json"),
            dir: path.join(__dirname, "..", "blockchain"),
            keyStoreDir: path.join(__dirname, "..", "blockchain", "keystore"),
            networkId: 123456,
            httpPort: 8545,
            wsPort: 8546,
            graphql: true,
            extra: `--unlock 0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb,0x9d4c6d4b84cd046381923c9bc136d6ff1fe292d9,0xbd355a7e5a7adb23b51f54027e624bfe0e238df6 --password ${path.join(__dirname, "..", "blockchain", "keystore", "password.txt")} --allow-insecure-unlock`,
        }
    ],
    logDir: path.join(__dirname, "..", "..", "data", `${(() => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}=${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    })()}`)
}
