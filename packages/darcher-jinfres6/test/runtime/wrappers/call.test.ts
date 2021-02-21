import {expect} from "chai"
import {$T$_CallF, $T$_CallM} from "../../../src/runtime/wrappers/call";

describe("runtime call wrapper testing", () => {
    it('$T$_CallM should not wrap function prototype', function () {
        let a = 0;

        function f() {
            a = 1;
        }

        expect(() => $T$_CallM({}, f, "apply", [])).not.to.throw(Error);
        expect(() => $T$_CallM({}, f, "bind", [])).not.to.throw(Error);
        expect(() => $T$_CallM({}, f, "call", [])).not.to.throw(Error);
        expect(() => $T$_CallM({}, f, "toString", [])).not.to.throw(Error).and.to.equal(f.name);
        expect(a).to.equal(1);
    });

    it('should correctly call function', function () {
        function f() {
            return 1;
        }

        expect($T$_CallF({}, f, [])).to.equal(1);
    });

    it('should correctly call object member', function () {
        let obj = {
            f: function () {
                return 1;
            }
        };

        expect($T$_CallM({}, obj, "f", [])).to.equal(1);
    })
});