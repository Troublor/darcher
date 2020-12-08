import {Config} from "@darcher/config";
import * as child_process from "child_process";
import * as path from "path";

export async function startCluster(config: Config){
    child_process.spawnSync(
        "docker-compose",
        ["-f", path.join(__dirname, "docker", "cluster-docker-compose.yml"), "up"], {
            env: Object.assign(process.env, {
                ETHMONITOR_CONTROLLER: config.clusters[0].controller,
                VERBOSITY: config.clusters[0].verbosity,
                ANALYZER_ADDR: `host.docker.internal:${config.analyzer.grpcPort}`,
            }),
            stdio: "inherit",
        }
    );
}
