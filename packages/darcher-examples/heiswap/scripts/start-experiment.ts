import * as path from "path";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";


if (require.main === module) {
    (async () => {
        const subjectDir = path.join(__dirname, "..");
        const heiswapConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "heiswap",
            dappUrl: "http://localhost:3000",
            crawljaxClassName: "HeiswapExperiment",
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
                dbAddress: "localhost:3000",
                elements: [
                    {
                        name: "status",
                        xpath: "//*[@id=\"root\"]/div/div/div[1]/div[2]/div/div[3]/div/div/div/div/div[1]"
                    },
                ]
            },

            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Default0",
        });
        await startExperiment(heiswapConfig);
    })().catch(e => console.error(e));
}
