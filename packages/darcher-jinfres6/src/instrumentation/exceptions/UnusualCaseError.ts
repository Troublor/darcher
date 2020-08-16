import BaseError from "./BaseError";

export default class UnusualCaseError extends BaseError {
    constructor(msg: string) {
        super(msg);
    }
}