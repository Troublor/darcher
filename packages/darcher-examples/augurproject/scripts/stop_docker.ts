import * as child_process from "child_process";
import * as path from "path";

export async function stopDocker() {
    child_process.spawnSync(
        "docker-compose",
        ["-f", path.join(__dirname, "docker", "cluster-docker-compose.yml"), "down"], {
            stdio: "inherit",
        }
    );
    child_process.spawnSync(
        "docker-compose",
        ["-f", path.join(__dirname, "docker", "0x-docker-compose.yml"), "down"], {
            stdio: "inherit",
        }
    );
    child_process.spawnSync(
        "docker",
        ["rm", "$(docker ps -a -q)"]
    );
}

if (require.main === module) {
    stopDocker();
}
