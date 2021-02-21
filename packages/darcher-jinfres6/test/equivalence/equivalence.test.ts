import * as fs from "fs";
import * as path from "path";
import instrument from "../../src/intrumentation/wrapper";
import {expect} from "chai"
import {setHook} from "../../src/runtime/wrapper";
import {BasicHook} from "../../src/runtime/hook";
import {notDeepEqual} from "assert";
import {originIObject} from "../../src/runtime/IObject";
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);


let shell = require("shelljs");

function instrumentAndRunAndCompare(dir: string, name: string): boolean {
    let tmp = name.split(".");
    tmp.splice(1, 0, "instru");
    let outName = tmp.join(".");
    instru(path.join(dir, name), path.join(dir, outName), "../../src/runtime/wrapper", "../hook/MyHook");
    let a = run(path.join(dir, name)),  b = run(path.join(dir, outName));
    return a === originIObject(b);
}

function run(src: string): any {
    let code = fs.readFileSync(src);
    return eval(code.toString());
    // {stdout: } await exec('git config --global user.name');
    // let out = shell.exec(`./node_modules/.bin/ts-node ${src}`);
    // return out.stdout + out.stderr;
}

function instru(src: string, dest: string, runtimeLibPath: string, hookPath: string): void {
    let content = fs.readFileSync(src);
    content = instrument(content.toString(), runtimeLibPath, hookPath);
    fs.writeFileSync(dest, content);
}

let dir = "test/equivalence";

describe("dbasyncer equivalence testing", () => {
    let exclude = [
        "assert2.js"
    ];
    const directoryPath = ".";
    for (let name of fs.readdirSync(directoryPath)) {
        if (name.split(".").length >= 3) {
            continue;
        }
        if (name.split(".").pop().toLowerCase() !== "js") {
            continue;
        }
        if (exclude.includes(name)) {
            continue;
        }
        it(`should equivalent ${name}`, function () {
            expect(instrumentAndRunAndCompare(dir, name)).to.equal(true);
        });
    }
    it('should equivalence one', function () {
        let name = "crypto1.js";
        // run(`${dir}/${name}`);
        expect(instrumentAndRunAndCompare(dir, name)).to.equal(true);
    });
});