import InstrumentHook from "./InstrumentHook";
import {BinaryExpression, CallExpression, Node, UnaryExpression} from "../ast/types";
import Context from "../runtime/Context";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";
import FnNameStack from "../tools/FnNameStack";

export class BinaryExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "BinaryExpression";
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_: BinaryExpression = <BinaryExpression>node;
        let ctx: Context = {fn: FnNameStack.v().get()};
        return BinaryExpressionHook.genBinaryExpressionWrapper(ctx, node_);
    }

    private static genBinaryExpressionWrapper(context: Context, expression: BinaryExpression): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.BinaryExpression.name,
            },
            "arguments": [
                genContext(context),
                expression.left,
                expression.right,
                {
                    "type": "Literal",
                    "value": expression.operator,
                    "raw": `'${expression.operator}'`
                }
            ]
        };
    }
}