import {expect} from "chai";
import {loadConfig} from "../src";
import * as path from "path";

describe("utilities", () => {
    it('should loadConfig work well', async function () {
        function testConfig(obj: object) {
            expect(typeof obj).to.be.equal("object");
            expect(obj).not.to.be.null;
            expect(obj).to.haveOwnProperty("analyzer");
            expect(obj).to.haveOwnProperty("dbMonitor");
            expect(obj).to.haveOwnProperty("clusters");
        }

        let config = await loadConfig(path.join(__dirname, "data", "config.ts"));
        testConfig(config);
        config = await loadConfig(path.join(__dirname, "data", "config.js"));
        testConfig(config);
        config = await loadConfig(path.join(__dirname, "data", "config.json"));
        testConfig(config);
    });
});