import Context from "../Context";

export function $T$_UpdateV(context: Context, arg: any, operator: string, prefix: boolean): any {
    if (prefix) {
        switch (operator) {
            case "++":
                return ++arg;
            case "--":
                return --arg;
        }
    } else {
        switch (operator) {
            case "++":
                return arg++;
            case "--":
                return arg--;
        }
    }
}

export function $T$_UpdateM(context: Context, obj: object, prop: any, operator: string, prefix: boolean): any {
    if (prefix) {
        switch (operator) {
            case "++":
                // @ts-ignore
                return ++obj[prop];
            case "--":
                // @ts-ignore
                return --obj[prop];
        }
    } else {
        switch (operator) {
            case "++":
                // @ts-ignore
                return obj[prop]++;
            case "--":
                // @ts-ignore
                return obj[prop]--;
        }
    }
}

export function $T$_Unary(context: Context, arg: any, operator: string): any {
    switch (operator) {
        case "+":
            return +arg;
        case"-":
            return -arg;
        case "~":
            return ~arg;
        case "!":
            return !arg;
        case "delete":
        case "void":
        case "typeof":
            // do not instrument "delete", "void", "typeof"
            return arg;

    }
}

export function $T$_Binary(context: Context, left: any, right: any, operator: string): any {
    switch (operator) {
        case "instanceof":
            return left instanceof right;
        case "in":
            return left in right;
        case "+":
            return left + right;
        case "-":
            return left - right;
        case "*":
            return left * right;
        case "/":
            return left / right;
        case "%":
            return left % right;
        case "**":
            return left ** right;
        case "|":
            return left | right;
        case "^":
            return left ^ right;
        case "&":
            return left & right;
        case "==":
            return left == right;
        case "!=":
            return left != right;
        case "===":
            return left === right;
        case "!==":
            return left !== right;
        case "<":
            return left < right;
        case ">":
            return left > right;
        case "<=":
            return left <= right;
        case ">=":
            return left >= right;
        case "<<":
            return left << right;
        case ">>":
            return left >> right;
        case ">>>":
            return left >>> right;
    }
}

export function $T$_Logical(context: Context, left: any, right: any, operator: string): any {
    switch (operator) {
        case "||":
            return left || right;
        case "&&":
            return left && right;
    }
}