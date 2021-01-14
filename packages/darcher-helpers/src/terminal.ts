/*
This module defines helpers for uses of terminal, including execute commands in new terminal tab and so on.
 */
import * as shell from "shelljs";
import * as os from "os";
import {Command as Cmd} from "@troubkit/cmd";

export const Command = Cmd;

export class Tab {
    // whether to open a new window
    public w: boolean;
    // the command to be executed in this tab
    public cmd: Cmd;
    // working directory of this tab
    public pwd: string;
    // tab title
    public title: string;

    public pid: number;

    constructor(cmd?: Cmd, w = false, pwd: string = undefined, title: string = undefined) {
        this.cmd = cmd;
        this.w = w;
        this.pwd = pwd;
        this.title = title;
    }

    public open() {
        executeInNewTab(this.cmd, this.w, this.pwd, this.title);
    }
}

export class TerminalWindow {
    private readonly tabs: Tab[];

    constructor(...tabs: Tab[]) {
        this.tabs = [...tabs];
    }

    public addTabs(...tabs: Tab[]) {
        this.tabs.push(...tabs);
    }

    // open the terminal window
    public open() {
        const osType = os.type();
        if (osType === "Darwin") {
            // MacOS
            let first = true;
            // only open the first tab in new window
            for (const tab of this.tabs) {
                tab.w = first;
                tab.open();
                first = false;
            }
        } else if (osType === "Linux") {
            // Linux // TODO currently only support ubuntu
            let first = true;
            const gnomeCmd = new Command("gnome-terminal");
            for (const tab of this.tabs) {
                if (first || tab.w) {
                    gnomeCmd.append("--window");
                    first = false;
                } else {
                    gnomeCmd.append("--tab");
                }
                if (tab.title) {
                    gnomeCmd.append(`--title="${tab.title}"`);
                }
                if (tab.pwd) {
                    gnomeCmd.append(`--working-directory="${tab.pwd}"`);
                }
                gnomeCmd.append(`--command="${tab.cmd.toString()}"`);
            }
            shell.exec(gnomeCmd.toString());
        } else {
            console.error(`Cannot open terminal in system: ${osType}`);
        }
    }
}

/**
 * Execute the given command at a new terminal tab
 * @param cmd the command to be executed
 * @param tabTitle the title of the tab
 * @param w whether to open tab in a new window
 * @param d working direction of the command
 */
function executeInNewTab(cmd: Cmd, w = false, d: string = undefined, tabTitle: string = undefined) {
    const osType = os.type();
    if (osType === "Darwin") {
        const c = new Command("ttab");
        c.append("-a iTerm2");
        if (w) {
            c.append("-w");
        }
        if (d !== undefined) {
            c.append(`-d '${d}'`);
        }
        if (tabTitle !== undefined) {
            c.append(`-t ${tabTitle}`);
        }
        shell.exec(`${c.toString()} ${cmd.toString()}`);
    } else if (osType === "Linux") {
        const gnomeCmd = new Command("gnome-terminal");
        if (w) {
            gnomeCmd.append("--window");
        } else {
            gnomeCmd.append("--tab");
        }
        if (tabTitle) {
            gnomeCmd.append(`--title="${tabTitle}"`);
        }
        if (d) {
            gnomeCmd.append(`--working-directory="${d}"`);
        }
        gnomeCmd.append(`--command="${cmd.toString()}"`);
        shell.exec(gnomeCmd.toString());
    } else {
        console.error(`Cannot open terminal in system: ${osType}`);
    }
}
