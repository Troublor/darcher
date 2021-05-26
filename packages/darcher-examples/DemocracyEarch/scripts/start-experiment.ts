import {Browser, loadConfig, Logger, MetaMask, sleep} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {ProposalService, reset, start} from "./dapp";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";
import {WebDriver} from "selenium-webdriver";
import {Darcher} from "@darcher/analyzer";


if (require.main === module) {
    (async () => {
        let proposalService: ProposalService;
        const subjectDir = path.join(__dirname, "..");
        const augurConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "DemocracyEarth",
            dappUrl: "http://localhost:3000",
            crawljaxClassName: "SovereignExperiment",
            resultDir: path.join(subjectDir, "results"),
            composeFile: path.join(subjectDir, "docker-compose.yml"),
            dockerStartWaitingTime: 10000,

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

            beforeStartCrawljaxHook: async (logger: Logger, webDriver: WebDriver, darcher: Darcher) => {
                child_process.execSync("npm i", {
                    cwd: path.join(__dirname, "..", "DemocracyDAO")
                });
                proposalService = new ProposalService(darcher, logger);
                await proposalService.start();
            },

            afterCrawljaxEndHook: async () => {
                if (proposalService) {
                    await proposalService.shutdown();
                }
            }
        });
        await startExperiment(augurConfig);
    })().catch(e => console.error(e));
}