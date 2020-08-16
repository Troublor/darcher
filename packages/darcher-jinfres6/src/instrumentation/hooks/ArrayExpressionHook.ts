import InstrumentHook from "./InstrumentHook";
import {ArrayExpression, ArrayExpressionElement, CallExpression, Identifier, Node} from "../ast/types";
import Context from "../runtime/Context";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";
import FnNameStack from "../tools/FnNameStack";

export class ArrayExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "ArrayExpression";
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }


    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_: ArrayExpression = <ArrayExpression>node;
        let ctx: Context = {fn: FnNameStack.v().get()};
        return ArrayExpressionHook.genArrayExpressionWrapper(ctx, node_.elements);
    }

    private static genArrayExpressionWrapper(context: Context, elements: ArrayExpressionElement[]): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.ArrayExpression.name,
            },
            "arguments": [
                genContext(context),
                ...elements,
            ]
        };
    }
}