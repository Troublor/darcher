import InstrumentHook from "./InstrumentHook";
import {ArgumentListElement, CallExpression, Identifier, Literal, MemberExpression, Node} from "../ast/types";
import WrapperNames from "../../runtime/wrappers/names";
import Context from "../runtime/Context";
import {genContext} from "../tools/utils";
import {SupportiveException} from "../exceptions/SupportiveException";
import FnNameStack from "../tools/FnNameStack";
import AstTraverser from "../traverser";

export default class CallExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "CallExpression";
    }

    /**
     * functionality
     * 1. do not wrap super() or super.method(), but other expression with super will still be wrapped
     * 2. wrap function call $T$_CallF
     * 3. wrap method call $T$_CallM
     * 4. attach a calling context at the first param of the wrapper
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_ = <CallExpression>node;
        if (node_.callee.type === "Super" ||
            node_.callee.type === "MemberExpression" && (<MemberExpression>node_.callee).object.type === "Super") {
            // do not wrap super() or super.method()
            return node_;
        }
        if (node_.callee.type === "MemberExpression") {
            // wrap CallM
            let memberExp: MemberExpression = node_.callee;
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
            return CallExpressionHook.genCallMWrapper(ctx, node_.callee.object, prop, node_.arguments);
        } else if (node_.callee.type === "CallExpression" && CallExpressionHook.isMemberWrapper(node_.callee)) {
            // if the callee is original MemberExpression but has been wrapped by MemberWrapper
            let ctx: Context = {fn: FnNameStack.v().get()};
            let memberWrapper: CallExpression = node_.callee;
            // the MemberWrapper function: $T$_Member(context, obj, prop)
            return CallExpressionHook.genCallMWrapper(ctx, memberWrapper.arguments[1], memberWrapper.arguments[2], node_.arguments);
        } else {
            // directly calling a function
            // wrap CallF
            if (node_.callee.type === "Identifier" && (<Identifier>node_.callee).name === "require") {
                // do not wrap require function otherwise there will be a 'cannot find module "."' error
                return node_;
            }
            let ctx = {fn: FnNameStack.v().get()};
            return CallExpressionHook.genCallFWrapper(ctx, node_.callee, node_.arguments);
        }
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    private static isMemberWrapper(node: CallExpression): boolean {
        return node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            node.callee.name === WrapperNames.Member.name;
    }

    private static genCallFWrapper(context: Context, fn: Node, args: ArgumentListElement[]): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.CallF.name,
            },
            "arguments": [
                genContext(context),
                fn,
                {
                    "type": "ArrayExpression",
                    "elements": args,
                }
            ]
        };
    }

    private static genCallMWrapper(context: Context, obj: Node, prop: Node, args: ArgumentListElement[]): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.CallM.name,
            },
            "arguments": [
                genContext(context),
                obj,
                prop,
                {
                    "type": "ArrayExpression",
                    "elements": args,
                }
            ]
        };
    }
};
