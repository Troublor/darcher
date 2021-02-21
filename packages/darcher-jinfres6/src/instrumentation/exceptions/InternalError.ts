import {Node} from "../ast/types";
import BaseError from "./BaseError";

export enum InternalErrorType {
    UNIMPLEMENTED = "Unimplemented",
    UNIQUE_VIOLATION = "UniqueViolation",
    DELEGATE_RETURN_VALUE_MISMATCH = "DelegateReturnValueMismatch",
    STACK_UNDERFLOW = "StackUnderflow",
}

/**
 * Internal Error is thrown when there are implementation errors in the code
 * This is usually caused by bugs in the instrumentation implementation, not caused by input data
 */
export class InternalError extends BaseError {
    public type: InternalErrorType;
    public msg: string;

    constructor(type: InternalErrorType, msg: string = "") {
        super(msg);
        this.type = type;
        this.msg = msg;
    }

    public toString(): string {
        return `InternalError: ${this.type}, ${this.msg}`;
    }
}

export class DelegateMismatchError extends InternalError {
    public returned: any;
    public node: Node;
    public parent: Node;
    public key: string;

    constructor(returned: any, node: Node, parent: Node, key: string) {
        super(InternalErrorType.DELEGATE_RETURN_VALUE_MISMATCH);
        this.returned = returned;
        this.node = node;
        this.parent = parent;
        this.key = key;
    }

    toString(): string {
        return `Delegate return value mismatch, return=${this.returned} node=${this.node.type}, parent=${this.parent.type}, key=${this.key}`;
    }
}