import InstrumentHook from "./InstrumentHook";
import {Node} from "../ast/types";
import {SupportiveException} from "../exceptions/SupportiveException";

export default class ArrowFunctionExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "ArrowFunctionExpression";
    }

    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        return node;
    }

    /**
     * functionality:
     * 1. throw exception if there is arrow function in source code (arrow function should be transformed by babel)
     * @param node
     * @param parent
     * @param key
     */
    preHandler(node: Node, parent: Node, key: string): boolean {
        throw new SupportiveException(node, "arrow function is not supported yet, please use babel to transform arrow function expression.");
    }

};