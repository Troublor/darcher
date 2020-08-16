import * as fs from "fs";
import * as path from "path";
import {instrument} from "../src/instrumentation";


function instrumentTestFile(fileName: string): void {
    let rawDir = "test/instrument/src_raw";
    let srcDir = "test/instrument/src";
    let content = fs.readFileSync(path.join(rawDir, fileName));
    content = instrument(content.toString(), "../../../src/runtime");
    fs.writeFileSync(path.join(srcDir, fileName), content);
}

describe("instrumentation testing", () => {
    it('should not instrument require()', function () {
        let fileName = "test1.js";

    });
});