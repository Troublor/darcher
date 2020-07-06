import "mocha";
import {expect} from "chai"
import {DAppStateChangeMsg, LifecycleState, logger} from "../../src/common";
import {TxAnalysis} from "../../src/analysis/analysis";
const fs = require("fs");

describe('dynamic analysis test', () => {
    it('tx analysis pool add should work', () => {
        let json: DAppStateChangeMsg[] = JSON.parse(fs.readFileSync("test/analysis/data.json"));
        let analysis = new TxAnalysis("");
        for (let state in json) {
            // @ts-ignore
            for (let msg of json[state]) {
                analysis.add(<LifecycleState>state, msg);
            }
        }
        if (analysis.analyze()) {
            logger.info("pass");
        } else {
            logger.info("failed")
        }
    });
});