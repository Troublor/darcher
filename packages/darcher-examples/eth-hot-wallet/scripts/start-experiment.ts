import * as path from "path";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";


if (require.main === module) {
    (async () => {
        const subjectDir = path.join(__dirname, "..");
        const ethHotWalletConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "eth-hot-wallet",
            dappUrl: "http://localhost:3001",
            crawljaxClassName: "EthHotWalletExperiment",
            resultDir: path.join(subjectDir, "results"),
            composeFile: path.join(subjectDir, "docker-compose.yml"),

            analyzerConfig: {
                grpcPort: 1234,
                wsPort: 1235,
                traceStorePort: 1236,
                txStateChangeProcessTime: 15000,
            },
            dbMonitorConfig: {
                db: DBOptions.html,
                dbName: "html",
                dbAddress: "localhost:3001",
                elements: [
                    {
                        name: "balance",
                        xpath: "//*[@id=\"app\"]/div/div/div[1]/div[2]/div/div/div[1]/div/div/div/div/div/div/table/tbody/tr/td[4]"
                    },
                    {
                        name: "txStatus",
                        xpath: "//div[@class='ant-modal-body']/div[5]"
                    }
                ]
            },

            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Default0",
        });
        await startExperiment(ethHotWalletConfig);
    })().catch(e => console.error(e));
}
