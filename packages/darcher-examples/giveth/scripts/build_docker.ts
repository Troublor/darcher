import {Config} from "@darcher/config";
import {Command, loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";

const IMAGE_NAME = "darcher/giveth-base";

function buildDocker(config: Config) {
    let cmd = new Command("docker")
        .append("build")
        .append("--no-cache")
        .append(`-t ${IMAGE_NAME}`)
        .append(`-f ${path.join(__dirname, "docker", "Dockerfile")}`)
        .append(path.join(__dirname));
    child_process.execSync(cmd.toString(), {
        stdio: "inherit",
    });
}

loadConfig(path.join(__dirname, "config", "giveth.config.ts")).then(config => {
    buildDocker(config);
});