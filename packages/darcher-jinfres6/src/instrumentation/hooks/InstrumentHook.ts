import {Node} from "../ast/types";

export default interface InstrumentHook {
    /**
     * @return string: the type of the AST node of this hook
     */
    getHookNodeType(): string;

    /**
     * This handler is called before entering an AST node when traversing AST
     * No change should be made to the node in the preHandler.
     * preHandler should only be used to check preconditions of instrumentation
     * @param node: The AST node about to enter
     * @param parent: The parent node of the current node about to enter
     * @param key: The key of the node in the parent node
     * @return boolean: do not enter the node if false
     */
    preHandler(node: Node, parent: Node, key: string): boolean

    /**
     * This handler is called after exiting an AST node when traversing AST
     * @param node: The AST node about to enter
     * @param parent: The parent node of the current node about to enter
     * @param key: The key of the node in the parent node
     * @return Node: The returned node will be used to replace the current node we just exit
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[]
}