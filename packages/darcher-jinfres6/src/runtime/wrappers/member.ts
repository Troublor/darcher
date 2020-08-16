import Context from "../Context";
import {InternalError, InternalErrorType} from "../../instrumentation/exceptions/InternalError";
import {getHook} from "./common";

/**
 * The wrapper function of get_member option
 * @param context
 * @param obj: the object to get member from
 * @param prop: the property name of the member
 * @return any: the member value
 */
export function $T$_Member(context: Context, obj: any, prop: any): any {
    let member = obj[prop];
    let tmp;
    try {
        tmp = getHook().onMember(context, obj, prop, member);
    } catch (e) {
        console.error(e);
        console.error(e.stack);
        tmp = member;
    }
    member = tmp;
    return member;
}