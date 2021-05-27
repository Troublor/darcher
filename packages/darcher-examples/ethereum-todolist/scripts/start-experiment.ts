import * as _ from "lodash";
import * as path from "path";
import {DBOptions} from "@darcher/config/dist";
import {baseConfig, ExperimentConfig, startExperiment} from "../../scripts/experiment";

if (require.main === module) {
    (async ()=>{
        const subjectDir = path.join(__dirname, "..");
        const todolistConfig: ExperimentConfig = Object.assign(_.cloneDeep(baseConfig), {
            dappName: "Todolist",
            dappUrl: "http://localhost:3000",
            crawljaxClassName: "TodolistExperiment",
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
                js: `
let lis = document.getElementsByTagName("li");
let data = [];
for(const li of lis){
    let text = li.getElementsByTagName("label")[0].textContent;
    data.push({
        "task": text,
    })
}
JSON.stringify(data);
        `
            },

            metamaskNetwork: "Localhost 8545",
            metamaskAccount: "Default0",
        });
        await startExperiment(todolistConfig);
    })()
}

