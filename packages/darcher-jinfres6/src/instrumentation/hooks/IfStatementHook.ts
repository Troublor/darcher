import InstrumentHook from "./InstrumentHook";
import {BlockStatement, IfStatement, Node} from "../ast/types";
import {SupportiveException} from "../exceptions/SupportiveException";

export default class IfStatementHook implements InstrumentHook {
    getHookNodeType(): string {
        return "IfStatement";
    }

    /**
     * functionality:
     * 1. if the consequence of if statement is express, convert it to BlockStatement
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_ = <IfStatement>node;
        // check if consequent is Expression
        if (node_.consequent.type !== "BlockStatement") {
            // convert to BlockStatement
            node_.consequent = <BlockStatement>{
                type: "BlockStatement",
                body: [
                    node_.consequent,
                ]
            };
        }
        if (node_.alternate !== null && node_.alternate.type !== "IfStatement" && node_.alternate.type !== "BlockStatement") {
            // convert to BlockStatement
            node_.alternate = <BlockStatement>{
                type: "BlockStatement",
                body: [
                    node_.alternate,
                ]
            };
        }
        return node_;
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

};