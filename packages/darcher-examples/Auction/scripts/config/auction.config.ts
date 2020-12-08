import {ClusterConfig, Config, ControllerOptions, DBOptions} from "@darcher/config";
import * as path from "path";

export const mainAccountAddress = "0x6463f93d65391a8b7c98f0fc8439efd5d38339d9";

export default <Config>{
    analyzer: {
        grpcPort: 1234,
        wsPort: 1235,
    },
    dbMonitor: {
        db: DBOptions.html,
        dbName: "html",
        dbAddress: "localhost:8080",
        elements: [
            {
                name: "serialNumber",
                xpath: "/html/body/div/div[1]/div/h1/span",
            },
            {
                name: "auctionTitle",
                xpath: "/html/body/div/div[4]/div/article/div/h4",
            },
            {
                name: "startPrice",
                xpath: "/html/body/div/div[4]/div/article/div/h6",
            },
            {
                name: "bidCount",
                xpath: "/html/body/div/div[4]/div/article/div/p[2]",
            },
            {
                name: "auctionStatus",
                xpath: "/html/body/div/div[4]/div/article/div/button",
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
            extra: `--allow-insecure-unlock --unlock ${mainAccountAddress} --password ${path.join(__dirname, "..", "..", "blockchain", "keystore", "passwords.txt")}`,
        }
    ],
    logDir: path.join(__dirname, "..", "..", "data", `${(() => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}=${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    })()}`)
}
