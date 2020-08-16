import InstrumentHook from "./InstrumentHook";
import {Node, Property} from "../ast/types";

export default class PropertyHook implements InstrumentHook{
    getHookNodeType(): string {
        return "Property";
    }

    /**
     * functionality:
     * 1. convert method properties to key-value properties
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        // convert method properties to key-value properties
        let node_: Property = <Property>node;
        node_.method = false;
        return node_;
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

}