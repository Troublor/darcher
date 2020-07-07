import "mocha";
import {expect} from "chai"
import {DAppStateChangeMsg, LifecycleState, logger, sleep} from "../../src/common";
import {TxAnalysis} from "../../src/analysis/analysis";
import {TxTraverseScheduler} from "../../src/analysis";

const fs = require("fs");

describe('TxTraverseScheduler test', () => {
    it('tx traverse scheduler should work', async () => {
        let scheduler = new TxTraverseScheduler();
        let scheduleResult: string[] = [];
        scheduler.waitForTurn("1").then(() => {
            scheduleResult.push("1");
            setTimeout(() => {
                scheduleResult.push("1");
                scheduler.finishTraverse("1");
            }, 200);
        })
        scheduler.waitForTurn("2").then(() => {
            scheduleResult.push("2");
            setTimeout(() => {
                scheduleResult.push("2");
                scheduler.finishTraverse("2");
            }, 200);
        });
        scheduler.waitForTurn("3").then(() => {
            scheduleResult.push("3");
            setTimeout(() => {
                scheduleResult.push("3");
                scheduler.finishTraverse("3");
            }, 200);
        });
        await sleep(1000);
        expect(scheduleResult).to.be.length(6);
        expect(scheduleResult[0]).to.be.equal("1");
        expect(scheduleResult[1]).to.be.equal("1");
        expect(scheduleResult[2]).to.be.equal("2");
        expect(scheduleResult[3]).to.be.equal("2");
        expect(scheduleResult[4]).to.be.equal("3");
        expect(scheduleResult[5]).to.be.equal("3");

    });
});