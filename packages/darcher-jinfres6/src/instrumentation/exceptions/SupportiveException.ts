import {Node} from "../ast/types";
import BaseError from "./BaseError";

export class SupportiveException extends BaseError {
    public node: Node;
    public msg: string;

    constructor(node: Node, msg: string) {
        super(msg);
        this.node = node;
        this.msg = msg;
    }

    toString(): string {
        return `Unsupported Node: ${this.node.type} - ${this.msg}`;
    }
}