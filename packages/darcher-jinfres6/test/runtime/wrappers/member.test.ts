import {expect} from "chai";
import {$T$_Member} from "../../../src/runtime/wrappers/member";

describe("runtime call wrapper testing", () => {
    it('$T$_Member should work', function () {
        let obj = {
            fn: function () {
            }
        };
        Object.getPrototypeOf(obj).foo = function () {
        };
        expect($T$_Member({}, obj, "fn")).to.equal(obj.fn);
        //@ts-ignore
        expect($T$_Member({}, obj, "foo")).to.equal(obj.foo);
    });

});