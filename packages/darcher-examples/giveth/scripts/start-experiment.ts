import {Browser, Command, loadConfig, Logger, MetaMask, sleep} from "@darcher/helpers";
import * as path from "path";
import * as fs from "fs";
import * as child_process from "child_process";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";
import * as _ from "lodash";
import {DBOptions} from "@darcher/config/dist";
import {WebDriver} from "selenium-webdriver";
import clearIndexedDB from "../../augurproject/scripts/clear-indexedDB";


function runAndLog(cmd: Command, cwd: string, logFile: string): child_process.ChildProcess {
    const logStream = fs.createWriteStream(logFile, {encoding: "utf-8"});
    const child = child_process.spawn(
        cmd.command, cmd.args, {
            stdio: ["inherit", "pipe", "pipe"],
            cwd: cwd,
        }
    )
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);
    return child;
}


if (require.main === module) {
    (async () => {
        process.env["PICTURE_PATH"] = path.join(__dirname, "..", "misc", "picture.png");
        const subjectDir = path.join(__dirname, "..");
        const givethConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "giveth",
            dappUrl: "http://localhost:3010",
            crawljaxClassName: "GivethExperiment",
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
                dbName: "giveth",
                dbAddress: "mongodb://localhost:27017",
            },

            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Giveth0",

            beforeStartCrawljaxHook: async (logger: Logger, driver: WebDriver)=>{
                logger.info("Clearing MetaMask data...");
                await new MetaMask(logger, driver, givethConfig.metamaskUrl, givethConfig.metamaskPassword)
                    .changeNetwork("Localhost 8545")
                    .changeAccount("Giveth0")
                    .resetAccount()
                    .changeNetwork("Localhost 8546")
                    .resetAccount()
                    .changeAccount("Giveth0")
                    .resetAccount()
                    .do();
                await clearIndexedDB(logger, driver, givethConfig.dappUrl, [givethConfig.dbMonitorConfig.dbName, "giveth"]);
                // TODO start dapp
                // return new Promise<void>(resolve => {
                //     // start dapp
                //     dappProcess = child_process.spawn("/bin/sh", ["./start-dapp.sh"], {
                //         cwd: path.join(__dirname),
                //         stdio: "pipe",
                //     })
                //     dappProcess.stdout.setEncoding("utf-8");
                //     dappProcess.stdout.on("data", data => {
                //         data = data.trim();
                //         data && process.stdout.write(data);
                //         if (data.includes("App running")) {
                //             resolve();
                //         }
                //     });
                //     dappProcess.stderr.pipe(process.stderr);
                // });
            },

            afterRoundEndHook: () => {
                // TODO stop dapp
                // TODO clear indexedDB
                // dappProcess.kill("SIGINT");
                // return new Promise<void>(resolve => {
                //     dappProcess.on("exit", () => {
                //         resolve();
                //     })
                // });
            }
        });
        await startExperiment(givethConfig);
    })().catch(e => console.error(e));
}
