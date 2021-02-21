import InstrumentHook from "./InstrumentHook";
import {CallExpression, Node, ObjectExpression} from "../ast/types";
import Context from "../runtime/Context";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";
import FnNameStack from "../tools/FnNameStack";

export class ObjectExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "ObjectExpression";
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_ = <ObjectExpression>node;
        let ctx: Context = {fn: FnNameStack.v().get()};
        return ObjectExpressionHook.genObjectExpressionWrapper(ctx, node_);
    }

    private static genObjectExpressionWrapper(context: Context, obj: ObjectExpression): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.ObjectExpression.name,
            },
            "arguments": [
                genContext(context),
                obj,
            ]
        };
    }

}