/*
This module defines helpers for uses of terminal, including execute commands in new terminal tab and so on.
 */
import * as shell from "shelljs";

export class Command {
    // multiple cmds will be joined with &&
    private otherCmds: Command[];
    // payload stores the content of current command
    private readonly payload: string[];

    /**
     * Construct a new Command, with optional segments
     * @param segments
     */
    constructor(...segments: string[]) {
        this.payload = [...segments];
        this.otherCmds = [];
    }

    /**
     * Append more segments to the end of command
     * @param segments
     */
    public append(...segments: string[]): Command {
        this.payload.push(...segments)
        return this;
    }

    /**
     * Concat other commands to this command. e.g. cd /var && ls -a
     * @param cmds
     */
    public concat(...cmds: Command[]): Command {
        this.otherCmds.push(...cmds);
        return this;
    }

    /**
     * Shallow copy this command, otherCmds will only copy reference
     */
    public copy(): Command {
        let cmd = new Command(...this.payload);
        cmd.otherCmds = [...this.otherCmds];
        return cmd;
    }

    public toString(): string {
        if (this.otherCmds.length <= 0) {
            return `${this.payload.join(" ")}`;
        } else {
            return `${this.payload.join(" ")} && ${this.otherCmds.map(cmd => cmd.toString()).join(" && ")}`;
        }
    }
}

export class Tab {
    // whether to open a new window
    public w: boolean
    // the command to be executed in this tab
    public cmd: Command;
    // working directory of this tab
    public pwd: string;
    // tab title
    public title: string

    constructor(cmd?: Command, w: boolean = false, pwd: string = undefined, title: string = undefined) {
        this.cmd = cmd;
        this.w = w;
        this.pwd = pwd;
        this.title = title
    }

    public open() {
        executeInNewTab(this.cmd, this.w, this.pwd, this.title);
    }
}

export class TerminalWindow {
    private tabs: Tab[];

    constructor(...tabs: Tab[]) {
        this.tabs = [...tabs];
    }

    public addTabs(...tabs: Tab[]) {
        this.tabs.push(...tabs);
    }

    // open the terminal window
    public open() {
        let first = true;
        // only open the first tab in new window
        for (let tab of this.tabs) {
            tab.w = first;
            tab.open();
            first = false;
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
export function executeInNewTab(cmd: Command, w: boolean = false, d: string = undefined, tabTitle: string = undefined) {
    // TODO implement if ttab is not available, e.g. Linux platform
    let c = new Command("ttab");
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
}