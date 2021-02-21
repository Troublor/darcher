import {expect} from "chai"

const chai = require("chai");

describe("internalError testing", () => {
    it('get member should have access to prototype chain', function () {
        let obj = {};
        let proto = Object.getPrototypeOf(obj);
        proto.member = 1;
        // @ts-ignore
        expect(obj.member).to.equal(1);
        // @ts-ignore
        expect(obj['member']).to.equal(1);
    });

    it('should get the function object when the function is a property of another object', function () {
        let obj = {
            fn1: function fn1() {
                // @ts-ignore
                expect(fn1.member).to.equal(1);
            },
            fn2: function fn2() {
                // @ts-ignore
                expect(fn2.member).to.equal(2);
            },
        };
        // @ts-ignore
        obj.fn1.member = 1;
        // @ts-ignore
        obj.fn2.member = 2;
        obj.fn1();
        obj.fn2();
    });

    it('should array contain', function () {
        let arr = ["a", "b"];
        expect("a" in arr).to.equal(false);
        expect(arr.includes("a")).to.equal(true);
    });

    it('function prototype functions should only be called as call_member', function () {
        function fn() {}
        let apply = fn.apply;
        expect(fn).not.to.throw(Error);
        // @ts-ignore
        expect(apply).to.throw(Error);
        let bind = fn.bind;
        // @ts-ignore
        expect(bind).to.throw(Error);
        let call = fn.call;
        // @ts-ignore
        expect(call).to.throw(Error);
        let toString = fn.toString;
        // @ts-ignore
        expect(toString).to.throw(Error);
    });
});