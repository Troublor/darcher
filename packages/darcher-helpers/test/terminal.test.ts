import {expect} from "chai";
import {Command, executeInNewTab, Tab, TerminalWindow} from "../src";

describe("terminal Commands", () => {
    it('should append success', function () {
        let cmd = new Command("ls");
        cmd.append("-a");
        expect(cmd.toString()).to.equal("ls -a");
    });

    it('should concat success', function () {
        let cmd1 = new Command("ls");
        let cmd2 = new Command("cd", "/");
        expect(cmd1.copy().concat(cmd2).toString()).to.equal("ls && cd /");
        expect(cmd1.concat(cmd2).toString()).to.equal("ls && cd /");
    });

    it('should get command correct', function () {
        let cmd = new Command("ls -a  -l");
        expect(cmd.args).to.be.lengthOf(2);
        expect(cmd.command).to.be.equal("ls");
    });
})

// describe("terminal and tab", () => {
//     it('should tab work correctly', function () {
//         let tab = new Tab(new Command("ls"));
//         tab.open();
//     });
//
//     it('should window work correctly', function () {
//         let tab = new TerminalWindow(new Tab(new Command("ls")), new Tab(new Command("uname")));
//         tab.open();
//     });
// })