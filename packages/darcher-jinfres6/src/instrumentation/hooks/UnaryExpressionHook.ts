import InstrumentHook from "./InstrumentHook";
import {CallExpression, Node, UnaryExpression} from "../ast/types";
import Context from "../runtime/Context";
import FnNameStack from "../tools/FnNameStack";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";

export class UnaryExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "UnaryExpression";
    }


    preHandler(node: Node, parent: Node, key: string): boolean {
        return true
    }

    /**
     * Functionality:
     * 1. do not instrument "delete", "typeof", "void"
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_: UnaryExpression = <UnaryExpression>node;
        switch (node_.operator) {
            case "delete":
            case "typeof":
            case "void":
                return node_;
        }
        let ctx: Context = {fn: FnNameStack.v().get()};
        return UnaryExpressionHook.genUnaryExpressionWrapper(ctx, node_);

    }

    private static genUnaryExpressionWrapper(context: Context, expression: UnaryExpression): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.UnaryExpression.name,
            },
            "arguments": [
                genContext(context),
                expression.argument,
                {
                    "type": "Literal",
                    "value": expression.operator,
                    "raw": `'${expression.operator}'`
                }
            ]
        };
    }
}