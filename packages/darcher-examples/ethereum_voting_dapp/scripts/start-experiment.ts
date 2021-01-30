import * as path from "path";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";


if (require.main === module) {
    (async () => {
        const subjectDir = path.join(__dirname, "..");
        const ethereumVotingDappConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "ethereum_voting_dapp",
            crawljaxClassName: "EthereumVotingDAppExperiment",
            resultDir: path.join(subjectDir, "results"),
            composeFile: path.join(subjectDir, "docker-compose.yml"),

            analyzerConfig: {
                grpcPort: 1234,
                wsPort: 1235,
                traceStorePort: 1236,
                txStateChangeProcessTime: 3000,
            },
            dbMonitorConfig: {
                db: DBOptions.html,
                dbName: "html",
                dbAddress: "localhost:8080",
                elements: [
                    {
                        name: "candidate1",
                        xpath: "//*[@id=\"candidate-1\"]"
                    },
                    {
                        name: "candidate2",
                        xpath: "//*[@id=\"candidate-2\"]"
                    },
                    {
                        name: "candidate3",
                        xpath: "//*[@id=\"candidate-3\"]"
                    },
                ]
            },

            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Default0",
        });
        await startExperiment(ethereumVotingDappConfig);
    })().catch(e => console.error(e));
}
