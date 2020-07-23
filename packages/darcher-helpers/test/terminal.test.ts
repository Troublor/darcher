import {expect} from "chai";
import {Command, executeInNewTab} from "../src";

describe("terminal Commands", () => {
    it('should append success', function () {
        let cmd = new Command("ls");
        cmd.append("-a");
        expect(cmd.toString()).to.equal("ls -a");
        executeInNewTab(cmd);
    });

    it('should concat success', function () {
        let cmd1 = new Command("ls");
        let cmd2 = new Command("cd", "/");
        expect(cmd1.copy().concat(cmd2).toString()).to.equal("ls && cd /");
        expect(cmd1.concat(cmd2).toString()).to.equal("ls && cd /");
    });
})