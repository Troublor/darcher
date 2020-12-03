import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";

async function start_dapp(): Promise<child_process.ChildProcess> {
    return child_process.spawn(
        "yarn",
        ["start"],{
            stdio:"inherit",
            cwd: path.join(__dirname, "..", "lordsofthesnails"),
        }
    )
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "lordsofthesnails.config.ts")).then(async config => {
        await start_dapp();
    });
}


