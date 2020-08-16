import InstrumentHook from "./InstrumentHook";
import {CallExpression, Identifier, Node, ThisExpression} from "../ast/types";
import Context from "../runtime/Context";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";
import FnNameStack from "../tools/FnNameStack";

export class ThisExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "";
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_: ThisExpression = <ThisExpression>node;
        let ctx: Context = {fn: FnNameStack.v().get()};
        return ThisExpressionHook.genThisWrapper(ctx, node_);
    }

    private static genThisWrapper(context: Context, self: ThisExpression): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.ThisExpression.name,
            },
            "arguments": [
                genContext(context),
                self,
            ]
        };
    }
}