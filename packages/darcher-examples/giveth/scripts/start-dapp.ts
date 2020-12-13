import {BlockchainCluster, Command, loadConfig, Tab, TerminalWindow} from "@darcher/helpers";
import * as path from "path";
import {darcherConfig, foreignClusterConfig, homeClusterConfig} from "./config/giveth.config";
import {Config} from "@darcher/config";

/**
 * Start feathers-giveth service
 * yarn start:networks
 * yarn start
 */
export function startFeathersGiveth(window: TerminalWindow) {
    let cmd1 = new Command("yarn");
    cmd1.append("start:networks");
    let tab1 = new Tab(cmd1, false, path.join(__dirname, "..", "feathers-giveth"));
    window.addTabs(tab1);
    let cmd2 = new Command("yarn");
    cmd2.append("start");
    let tab2 = new Tab(cmd2, false, path.join(__dirname, "..", "feathers-giveth"));
    window.addTabs(tab2);
}

/**
 * Start giveth dapp
 * yarn start
 */
export function startGivethDApp(window: TerminalWindow) {
    let cmd = new Command("yarn");
    cmd.append("start");
    let tab = new Tab(cmd, false, path.join(__dirname, "..", "giveth-dapp"));
    window.addTabs(tab);
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "giveth.config.ts")).then(async config => {
        setTimeout(() => {
            let window = new TerminalWindow();
            startFeathersGiveth(window)
            startGivethDApp(window);
            window.open();
        }, 3000);
    });

}
