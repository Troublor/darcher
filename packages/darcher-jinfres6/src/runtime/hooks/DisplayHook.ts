import BaseHook from "./BaseHook";
import Context from "../Context";

export default class DisplayHook extends BaseHook{
    beforeCallF(context: Context, fn: Function, args: any[]): [Function, any[]] {
        return super.beforeCallF(context, fn, args);
    }

    afterCallF(context: Context, fn: Function, args: any[], returned: any): any {
        return super.afterCallF(context, fn, args, returned);
    }

    beforeCallM(context: Context, obj: object, prop: any, args: any[]): [object, any, any[]] {
        return super.beforeCallM(context, obj, prop, args);
    }

    afterCallM(context: Context, obj: object, prop: any, args: any[], returned: any): any {
        return super.afterCallM(context, obj, prop, args, returned);
    }

    onMember(context: Context, obj: object, prop: any, value: any): any {
        return super.onMember(context, obj, prop, value);
    }

    onStartFn(context: Context, args: any[], argList: IArguments): void {
        super.onStartFn(context, args, argList);
    }

    onFinishFn(context: Context): void {
        super.onFinishFn(context);
    }
}