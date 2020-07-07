import {expect} from "chai";
import {isEqualState, LogicalTxState} from "../src/analyzer";
import {TxState} from "@darcher/rpc";

describe("logical tx state", () => {
    it('should compare with tx state', function () {
        expect(isEqualState(TxState.CREATED, LogicalTxState.CREATED)).to.be.true;
        expect(isEqualState(TxState.PENDING, LogicalTxState.PENDING)).to.be.true;
        expect(isEqualState(TxState.EXECUTED, LogicalTxState.REEXECUTED)).to.be.true;
        expect(isEqualState(TxState.PENDING, LogicalTxState.REVERTED)).to.be.true;
    });
})