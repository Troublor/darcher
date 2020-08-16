import Context from "../Context";
import {InternalError, InternalErrorType} from "../../instrumentation/exceptions/InternalError";
import {getHook} from "./common";

/**
 * wrapper function for function call
 * @param context
 * @param fn: the function to be called
 * @param args: the arguments passed to the function call
 * @return any: the return value of function call
 */
export function $T$_CallF(context: Context, fn: any, args: any[]): any {
    let tmp;
    try {
        tmp = getHook().beforeCallF(context, fn, args);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
        tmp = [fn, args];
    }
    let [fn_, args_] = tmp;
    let returned = fn_.apply(null, args_);
    try {
        tmp = getHook().afterCallF(context, fn_, args_, returned);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
        tmp = returned;
    }
    returned = tmp;
    return returned;
}

/**
 * wrapper function for object property call
 * (the property of an object is a function)
 * @param context
 * @param obj: the object, property of which to be called
 * @param prop: the property name
 * @param args: the arguments of the function
 * @return any: the return value of function call
 */
export function $T$_CallM(context: Context, obj: any, prop: any, args: any[]): any {
    // check fn is not function prototype
    if (typeof obj === 'function' && ["apply", "call", "bind", "toString", "toSource", "isGenerator"].includes(prop)) {
        return obj[prop](...args);
    }
    let tmp;
    try {
        tmp = getHook().beforeCallM(context, obj, prop, args);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
        tmp = [obj, prop, args];
    }
    let [obj_, prop_, args_] = tmp;
    // @ts-ignore
    let returned = obj_[prop_].apply(obj_, args_);
    try {
        tmp = getHook().afterCallM(context, obj_, prop_, args_, returned);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
        tmp = returned;
    }
    returned = tmp;
    return returned;
}