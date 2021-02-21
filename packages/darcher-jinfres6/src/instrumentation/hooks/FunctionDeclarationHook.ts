import FunctionExpressionHook from "./FunctionExpression";

/**
 * Inherit the logic of FunctionExpressionHook
 */
export default class FunctionDeclarationHook extends FunctionExpressionHook {
    getHookNodeType(): string {
        return "FunctionDeclaration";
    }
};

