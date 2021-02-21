import Context from "../runtime/Context";
import {Expression, ObjectExpression, Property} from "../ast/types";
import {INSTRU_SUFFIX} from "../../runtime/common";

export function isObject(v: any): boolean {
    return typeof v === 'object' && v !== null;
}

export function isAstNode(obj: any): boolean {
    return isObject(obj) && obj.hasOwnProperty !== undefined && obj.hasOwnProperty("type");
}

export function isNull(v: any): boolean {
    return v === null;
}

let tempVarNameCount = 0;
export function genTempVarName(): string {
    return `Var${tempVarNameCount++}${INSTRU_SUFFIX}`;
}

export function genContext(ctx: Context): ObjectExpression {
    function genFnProperty(key: string, value: string): Property {
        let v: Expression;
        if (value === null) {
            v = {
                type: "Literal",
                value: null,
                raw: "null",
            };
        } else{
            // check if fn name is this.methodName
            let tmp = value.split(".");
            if (tmp.length === 2 && tmp[0] === "this") {
                v = {
                    type: "MemberExpression",
                    computed: false,
                    object: {
                        type: "ThisExpression",
                    },
                    property: {
                        type: "Identifier",
                        name: tmp[1],
                    },
                };
            }else {
                v = {
                    type: "Identifier",
                    name: value,
                };
            }
        }
        return <Property>{
            type: "Property",
            key: {
                type: "Identifier",
                name: key,
            },
            computed: false,
            value: v,
            kind: "init",
            method: false,
            shorthand: false,
        };
    }
    let properties = [];
    for (let key of Object.keys(ctx)) {
        // @ts-ignore
        if (key === "fn") {
            properties.push(genFnProperty(key, ctx[key]));
        }
    }
    return <ObjectExpression>{
        type: "ObjectExpression",
        properties: properties,
    };
}