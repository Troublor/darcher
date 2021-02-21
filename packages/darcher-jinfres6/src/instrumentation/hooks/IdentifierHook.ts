import InstrumentHook from "./InstrumentHook";
import {CallExpression, Identifier, Node} from "../ast/types";
import WrapperNames from "../../runtime/wrappers/names";
import {genContext} from "../tools/utils";
import Context from "../runtime/Context";
import FnNameStack from "../tools/FnNameStack";

export class IdentifierHook implements InstrumentHook {
    getHookNodeType(): string {
        return "Identifier";
    }


    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_ = <Identifier>node;
        let ctx: Context = {fn: FnNameStack.v().get()};
        return IdentifierHook.genIdentifierWrapper(ctx, node_);

    }

    private static genIdentifierWrapper(context: Context, identifier: Identifier): CallExpression {
        return <CallExpression>{
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": WrapperNames.Identifier.name,
            },
            "arguments": [
                genContext(context),
                identifier,
            ]
        };
    }
}