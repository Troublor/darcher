import {ClusterConfig, Config, ControllerOptions, DBOptions} from "@darcher/config";
import * as path from "path";

export const mainAccountAddress = "0x6463f93d65391a8b7c98f0fc8439efd5d38339d9";

export default <Config>{
    analyzer: {
        grpcPort: 1234,
        wsPort: 1235,
        txStateChangeProcessTime: 15000
    },
    dbMonitor: {
        db: DBOptions.html,
        dbName: "html",
        dbAddress: "localhost:3000",
        js: `
        JSON.stringify(localStorage)
        `
    },
    clusters: [
        <ClusterConfig>{
            analyzerAddress: "localhost:1234",
            ethmonitorPort: 8989,
            controller: ControllerOptions.darcher,
            genesisFile: path.join(__dirname, "..", "..", "blockchain", "genesis.json"),
            dir: path.join(__dirname, "..", "..", "blockchain"),
            keyStoreDir: path.join(__dirname, "..", "..", "blockchain", "keystore"),
            networkId: 2020,
            httpPort: 8545,
            wsPort: 8546,
            graphql: true,
            extra: `--allow-insecure-unlock --unlock ${mainAccountAddress} --password ${path.join(__dirname, "..", "..", "blockchain", "keystore", "passwords.txt")}`,
        }
    ],
    logDir: path.join(__dirname, "..", "..", "data", `${(() => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}=${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    })()}`)
}
