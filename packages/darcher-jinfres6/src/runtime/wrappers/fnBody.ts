import Context from "../Context";
import {getHook} from "./common";

export function $T$_StartFn(context: Context, args: any[], argList: IArguments): void {
    try {
        getHook().onStartFn(context, args, argList);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}

export function $T$_FinishFn(context: Context) {
    try {
        getHook().onFinishFn(context);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}