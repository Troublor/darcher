import {InternalError, InternalErrorType} from "../exceptions/InternalError";

export default class Stack<T> {
    private stack: T[] = [];

    public push(name: T): void {
        this.stack.unshift(name);
    }

    public pop(): T {
        if (this.length() <= 0) {
            throw new InternalError(InternalErrorType.STACK_UNDERFLOW);
        }
        return this.stack.shift();
    }

    public get(index: number = 0): T {
        return this.stack[index];
    }

    public length(): number {
        return this.stack.length;
    }
}