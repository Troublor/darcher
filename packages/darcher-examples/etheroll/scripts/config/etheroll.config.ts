import {ClusterConfig, Config, ControllerOptions, DBOptions} from "@darcher/config";
import * as path from "path";

export const mainAccountAddress = "0x6463f93d65391a8b7c98f0fc8439efd5d38339d9";
export const oraclizeAccountAddress = "0xba394b1eafcbbce84939103e2f443b80111be596";

export default <Config>{
    analyzer: {
        grpcPort: 1234,
        wsPort: 1235,
        txStateChangeProcessTime: 15000,
    },
    dbMonitor: {
        db: DBOptions.html,
        dbName: "html",
        dbAddress: "localhost:3000",
        elements: [
            {
                name: "transactions",
                xpath: "//*[@id=\"root\"]/div/div/div[2]/div/div[2]/div",
            }
        ]
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
            extra: `--allow-insecure-unlock --unlock ${mainAccountAddress},${oraclizeAccountAddress} --password ${path.join(__dirname, "..", "..", "blockchain", "keystore", "passwords.txt")}`,
        }
    ],
    logDir: path.join(__dirname, "..", "..", "data", `${(() => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}=${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    })()}`)
}
