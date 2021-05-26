import * as path from "path";
import * as child_process from "child_process";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";


if (require.main === module) {
    (async () => {
        const subjectDir = path.join(__dirname, "..");
        const publicvotesConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "publicvotes",
            dappUrl: "http://localhost:3001",
            crawljaxClassName: "PublicVotesExperiment",
            resultDir: path.join(subjectDir, "results"),
            composeFile: path.join(subjectDir, "docker-compose.yml"),

            analyzerConfig: {
                grpcPort: 1234,
                wsPort: 1235,
                traceStorePort: 1236,
                txStateChangeProcessTime: 15000,
            },
            dbMonitorConfig: {
                db: DBOptions.mongoDB,
                dbName: "meteor",
                dbAddress: "mongodb://localhost:3001",
            },

            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Default0",
        });
        await startExperiment(publicvotesConfig);
    })().catch(e => console.error(e));
}
