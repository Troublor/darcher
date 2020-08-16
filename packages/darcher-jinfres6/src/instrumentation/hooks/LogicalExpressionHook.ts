import InstrumentHook from "./InstrumentHook";
import {CallExpression, LogicalExpression, Node} from "../ast/types";
import Context from "../runtime/Context";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";
import FnNameStack from "../tools/FnNameStack";

export class LogicalExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "LogicalExpression";
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    /**
     * TODO have problem with short circuit
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_: LogicalExpression = <LogicalExpression>node;
        let ctx: Context = {fn: FnNameStack.v().get()};
        return LogicalExpressionHook.genLogicalExpressionWrapper(ctx, node_);
    }

    private static genLogicalExpressionWrapper(context: Context, expression: LogicalExpression): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.LogicalExpression.name,
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