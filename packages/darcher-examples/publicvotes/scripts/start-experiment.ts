import * as path from "path";
import * as child_process from "child_process";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";


if (require.main === module) {
    (async () => {
        const subjectDir = path.join(__dirname, "..");
        let dappProcess: child_process.ChildProcess;
        const publicvotesConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "publicvotes",
            crawljaxClassName: "PublicVotesExperiment",
            resultDir: path.join(subjectDir, "results"),
            composeFile: path.join(subjectDir, "docker-compose.yml"),

            analyzerConfig: {
                grpcPort: 1234,
                wsPort: 1235,
                traceStorePort: 1236,
                txStateChangeProcessTime: 3000,
            },
            dbMonitorConfig: {
                db: DBOptions.mongoDB,
                dbName: "meteor",
                dbAddress: "mongodb://localhost:3001",
            },

            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Default0",

            beforeStartRoundHook: async ()=>{
                return new Promise<void>(resolve => {
                    // start dapp
                    dappProcess = child_process.spawn("/bin/sh", ["./start-dapp.sh"], {
                        cwd: path.join(__dirname),
                        stdio: "pipe",
                    })
                    dappProcess.stdout.setEncoding("utf-8");
                    dappProcess.stdout.on("data", data => {
                        data = data.trim();
                        data && process.stdout.write(data);
                        if (data.includes("App running")) {
                            resolve();
                        }
                    });
                    dappProcess.stderr.pipe(process.stderr);
                });
            },

            afterRoundEndHook: () => {
                // stop dapp
                dappProcess.kill("SIGINT");
                return new Promise<void>(resolve => {
                    dappProcess.on("exit", () => {
                        resolve();
                    })
                });
            }
        });
        await startExperiment(publicvotesConfig);
    })().catch(e => console.error(e));
}
