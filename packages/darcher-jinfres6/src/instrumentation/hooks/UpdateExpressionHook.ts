import InstrumentHook from "./InstrumentHook";
import {
    CallExpression,
    Expression,
    Identifier, Literal,
    MemberExpression,
    Node,
    ObjectExpression,
    UpdateExpression
} from "../ast/types";
import Context from "../runtime/Context";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";
import FnNameStack from "../tools/FnNameStack";
import {SupportiveException} from "../exceptions/SupportiveException";

export class UpdateExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "UpdateExpression";
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    /**
     * Functionality
     * 1. do not wrap primitive type variable update, e.g. int i = 0; i++;
     * 2. only wrap object property update
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_: UpdateExpression = <UpdateExpression>node;
        if (node_.argument.type === "Super" ||
            node_.argument.type === "MemberExpression" && (<MemberExpression>node_.argument).object.type === "Super") {
            // do not wrap super++ or super.prop++
            return node_;
        }
        if (node_.argument.type === "MemberExpression") {
            // wrap UpdateM
            let memberExp: MemberExpression = node_.argument;
            let prop;
            if (memberExp.computed) {
                // computed property, prop should be directly passed to wrapper
                prop = memberExp.property;
            } else {
                if (memberExp.property.type !== "Identifier") {
                    throw new SupportiveException(node, "MemberExpression callee of a non-computed property is not a Identifier");
                }
                // non-computed property should be convert to literal
                let name = (<Identifier>(memberExp.property)).name;
                prop = <Literal>{
                    type: "Literal",
                    value: name,
                    raw: `\"${name}\"`,
                };
            }
            let ctx: Context = {fn: FnNameStack.v().get()};
            return UpdateExpressionHook.genUpdateMWrapper(ctx, node_.argument.object, prop, node_);
        } else if (node_.argument.type === "CallExpression" && UpdateExpressionHook.isMemberWrapper(node_.argument)) {
            // if the update target is original MemberExpression but has been wrapped by MemberWrapper
            let ctx: Context = {fn: FnNameStack.v().get()};
            let memberWrapper: CallExpression = node_.argument;
            // the MemberWrapper function: $T$_Member(context, obj, prop)
            return UpdateExpressionHook.genUpdateMWrapper(ctx, <Expression>memberWrapper.arguments[1], <Expression>memberWrapper.arguments[2], node_);
        } else {
            // directly update a variable
            // do not wrap
            return node_;
        }
    }

    private static genUpdateVWrapper(context: Context, expression: UpdateExpression): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.UpdateV.name,
            },
            "arguments": [
                genContext(context),
                expression.argument,
                {
                    "type": "Literal",
                    "value": expression.operator,
                    "raw": `'${expression.operator}'`
                },
                {
                    "type": "Literal",
                    "value": expression.prefix,
                    "raw": `${expression.prefix}`
                }
            ]
        };
    }

    private static genUpdateMWrapper(context: Context, obj: Expression, prop: Expression, update: UpdateExpression): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.UpdateM.name,
            },
            "arguments": [
                genContext(context),
                obj,
                prop,
                {
                    "type": "Literal",
                    "value": update.operator,
                    "raw": `'${update.operator}'`
                },
                {
                    "type": "Literal",
                    "value": update.prefix,
                    "raw": `${update.prefix}`
                }
            ]
        };
    }

    private static isMemberWrapper(node: CallExpression): boolean {
        return node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            node.callee.name === WrapperNames.Member.name;
    }
}