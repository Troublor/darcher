import Context from "../Context";

export default class BaseHook {
    // CallExpression
    /**
     * this hook is called before a function is called
     * @param context
     * @param fn: the function to be called
     * @param args: the arguments to be passed to the function
     * @return Function: the substitute function to replace the original function to be called
     * @return any[]: the substitute arguments list to replace the original arguments list to be passed to function call
     */
    public beforeCallF(context: Context, fn: Function, args: any[]): [Function, any[]] {
        return [fn, args];
    }

    /**
     * this hook is called before a function is called
     * @param context
     * @param fn: the function to be called
     * @param args: the arguments to be passed to the function
     * @param returned: the returned value of function call
     * @return any: the substitute return valued to replace the original returned value
     */
    public afterCallF(context: Context, fn: Function, args: any[], returned: any): any {
        return returned;
    }

    /**
     * this hook is called before a member of object is called
     * @param context
     * @param obj: the object the member of which to be called
     * @param prop: the member name
     * @param args: the arguments to be passed to the function
     * @return object: the substitute obj
     * @return any: the substitute prop
     * @return any[]: the substitute argument list
     */
    public beforeCallM(context: Context, obj: object, prop: any, args: any[]): [object, any, any[]] {
        return [obj, prop, args];
    }


    /**
     * this hook is called before a member of object is called
     * @param context
     * @param obj: the object the member of which to be called
     * @param prop: the member name
     * @param args: the arguments to be passed to the function
     * @param returned: the returned value of function call
     * @return any: the substitute return valued to replace the original returned value
     */
    public afterCallM(context: Context, obj: object, prop: any, args: any[], returned: any): any {
        return returned;
    }

    // MemberExpression
    /**
     * this hook is called when getting member of an object
     * @param context
     * @param obj: the object to get member from
     * @param prop: the property name
     * @param value: the value of the member
     * @return any: the substitute member value
     */
    public onMember(context: Context, obj: object, prop: any, value: any): any {
        return value;
    }

    /**
     * this hook is called in the beginning of function body execution
     * @param context
     * @param args: the declared arguments of the function
     * @param argList: the javascript built-in arguments variable
     */
    public onStartFn(context: Context, args: any[], argList: IArguments): void {
        return;
    }

    /**
     * this hook is called at the end of function body execution
     * @param context
     */
    public onFinishFn(context: Context): void {
        return;
    }
};