import * as path from "path";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";


if (require.main === module) {
    (async () => {
        const subjectDir = path.join(__dirname, "..");
        const multisenderConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "metamask",
            dappUrl: "chrome-extension://jkkjbjbnkionjiifkkhjfjhneoocpine/home.html",
            crawljaxClassName: "MetaMaskExperiment",
            resultDir: path.join(subjectDir, "results"),
            composeFile: path.join(subjectDir, "docker-compose.yml"),

            analyzerConfig: {
                grpcPort: 1234,
                wsPort: 1235,
                traceStorePort: 1236,
                txStateChangeProcessTime: 3000,
            },
            dbMonitorConfig: {
                db: DBOptions.extensionStorage,
                dbName: "",
                dbAddress: "",
            },

            metamaskUrl:"chrome-extension://jkkjbjbnkionjiifkkhjfjhneoocpine/home.html",
            metamaskPassword: "12345678",
            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Default0",
        });
        await startExperiment(multisenderConfig);
    })().catch(e => console.error(e));
}
