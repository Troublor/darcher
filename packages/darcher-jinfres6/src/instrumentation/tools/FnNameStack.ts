/**
 * This is the stack storing the function name that current code block is inside on the top of the stack
 */
import Stack from "./Stack";
import {INSTRU_PREFIX} from "../../runtime/common";

export default class FnNameStack extends Stack<string> {
    private static FnNameGenCount = 0;

    private static value = new FnNameStack();

    public static v(): FnNameStack {
        return FnNameStack.value;
    }

    /**
     * generate a new function name
     */
    public static genFnName():string{
        return `${INSTRU_PREFIX}Fn${FnNameStack.FnNameGenCount++}`;
    }
}