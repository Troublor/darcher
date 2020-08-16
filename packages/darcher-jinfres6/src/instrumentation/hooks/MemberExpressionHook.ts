import InstrumentHook from "./InstrumentHook";
import {CallExpression, Expression, Identifier, Literal, MemberExpression, Node, UnaryExpression} from "../ast/types";
import Context from "../runtime/Context";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";
import {SupportiveException} from "../exceptions/SupportiveException";
import FnNameStack from "../tools/FnNameStack";

export default class MemberExpressionHook implements InstrumentHook {
    private static backendVars: string[] = [
        'process'
    ];

    getHookNodeType(): string {
        return "MemberExpression";
    }

    /**
     * functionality:
     * 1. wrap $T$_Member()
     * 2. do not wrap Member when it is at the left of assignment
     * 3. do not wrap Member when it is used in delete statement
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_ = <MemberExpression>node;
        // do not wrap super.property
        if (node_.object.type === "Super") {
            return node_;
        }
        // if the object of member expression is backend variable, don't instrument
        if (node_.object.type == "Identifier" && MemberExpressionHook.backendVars.includes(node_.object.name)) {
            return node_;
        }
        // do not wrap left side of assignment
        // do not wrap delete
        switch (parent.type) {
            case "AssignmentExpression":
            case "AssignmentPattern":
                if (key === "left") {
                    return node_;
                }
                break;
            case "UnaryExpression":
                let parent_ = <UnaryExpression>parent;
                if (parent_.operator === "delete") {
                    return node_;
                }
                break;
        }
        let obj: Expression = node_.object;
        let prop: Expression;
        if (node_.computed) {
            // if the property is computed (e.g. obj[prop])
            prop = node_.property;
        } else if (node_.property.type === "Identifier") {
            // if the propery is non-computed (e.g. obj.prop)
            prop = <Literal>{
                type: "Literal",
                value: node_.property.name,
                raw: `\"${node_.property.name}\"`,
            };
        }
        let ctx = {fn: FnNameStack.v().get()};
        return MemberExpressionHook.genMemberWrapper(ctx, obj, prop);
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    private static genMemberWrapper(ctx: Context, obj: Expression, prop: Expression): CallExpression {
        return <CallExpression>{
            type: "CallExpression",
            callee: <Identifier>{
                type: "Identifier",
                name: WrapperNames.Member.name,
            },
            arguments: [
                genContext(ctx),
                obj,
                prop,
            ],
        };
    }
}