import InstrumentHook from "./InstrumentHook";
import {
    ArrayExpression, ArrayPattern,
    ArrowFunctionExpression, AssignmentPattern, BlockStatement, Expression, ExpressionStatement,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    Node,
    ObjectExpression, ObjectPattern, ReturnStatement, VariableDeclaration, VariableDeclarator
} from "../ast/types";
import {SupportiveException} from "../exceptions/SupportiveException";
import {INSTRU_PREFIX} from "../../runtime/common";
import {genContext, genTempVarName} from "../tools/utils";
import Context from "../runtime/Context";
import FnNameStack from "../tools/FnNameStack";
import WrapperNames from "../../runtime/wrappers/names";
import AstTraverser from "../traverser";

export default class BlockStatementHook implements InstrumentHook {
    getHookNodeType(): string {
        return "BlockStatement";
    }

    /**
     * functionality
     * 1. add $T$_StartFn() wrapper at the beginning of the function
     * 2. add $T$_FinishFn() wrapper at the end of the function (not necessarily the last line of function body, because function may return in the middle)
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        /**
         * This hook is only used here
         * It can extract the return statement from `return expression()` to `const tmp = expression(); return tmp;`
         * It is used to add a $T$_FinishFn() wrapper before return statement
         */
        class InstrumentBeforeReturnHook implements InstrumentHook {
            private readonly ctx: Context;
            public hasReturn = false;

            constructor(ctx: Context) {
                this.ctx = ctx;
            }

            getHookNodeType(): string {
                return "ReturnStatement";
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                let node_ = <ReturnStatement>node;
                if (node_.argument === null) {
                    // if there is no return argument
                    return [
                        BlockStatementHook.genFinishFnWrapper(this.ctx),
                        node_,
                    ];
                }
                let tempVarName = genTempVarName();
                return [
                    InstrumentBeforeReturnHook.genIntermediateVarDeclaration(tempVarName, node_.argument),
                    BlockStatementHook.genFinishFnWrapper(this.ctx),
                    InstrumentBeforeReturnHook.genReturnStatement(tempVarName),
                ];
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                this.hasReturn = true;
                return true;
            }

            public static genReturnStatement(varName: string): ReturnStatement {
                return <ReturnStatement>{
                    type: "ReturnStatement",
                    argument: <Identifier>{
                        type: "Identifier",
                        name: varName,
                    }
                }
            }

            public static genIntermediateVarDeclaration(varName: string, expr: Expression): VariableDeclaration {
                return <VariableDeclaration>{
                    type: "VariableDeclaration",
                    kind: "const",
                    declarations: [
                        <VariableDeclarator>{
                            type: "VariableDeclarator",
                            id: {
                                type: "Identifier",
                                name: varName,
                            },
                            init: expr,
                        }
                    ],
                };
            }
        }

        class NoEnterFunctionExpressionHook implements InstrumentHook {
            getHookNodeType(): string {
                return "FunctionExpression";
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                return node;
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                return false;
            }
        }

        class NoEnterFunctionDeclarationHook implements InstrumentHook {
            getHookNodeType(): string {
                return "FunctionDeclaration";
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                return node;
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                return false;
            }
        }

        class NoEnterClassDeclarationHook implements InstrumentHook {
            getHookNodeType(): string {
                return "ClassDeclaration";
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                return node;
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                return false;
            }
        }

        class NoEnterClassExpressionHook implements InstrumentHook {
            getHookNodeType(): string {
                return "ClassExpression";
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                return node;
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                return false;
            }
        }

        class NoEnterArrowFunctionExpressionHook implements InstrumentHook {
            getHookNodeType(): string {
                return "ArrowFunctionExpression";
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                return node;
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                return false;
            }
        }

        // in the beginning of the body of the function
        let node_ = <BlockStatement>node;
        switch (parent.type) {
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "ArrowFunctionExpression":
                // retrieve params from the function declaration
                let ids: Identifier[] = [];
                for (let param of (<FunctionDeclaration | FunctionExpression | ArrowFunctionExpression>parent).params) {
                    ids.push(...BlockStatementHook.collectDeclarator(param));
                }
                // generate a function call statement in the beginning of the body
                let ctx: Context = {fn: FnNameStack.v().get()};
                node_.body.unshift(BlockStatementHook.genStartFnWrapper(ctx, ids));

                // instrument $T$_FinishFn() wrapper
                // if there is return statement, this wrapper should be put right before return statement
                // if there is not return statement, this wrapper should be put on the last line of function body
                let functionBodyTraverser = new AstTraverser(node_);
                let h: InstrumentBeforeReturnHook = new InstrumentBeforeReturnHook(ctx);
                functionBodyTraverser.addHook(h);
                functionBodyTraverser.addHook(new NoEnterFunctionExpressionHook());
                functionBodyTraverser.addHook(new NoEnterFunctionDeclarationHook());
                functionBodyTraverser.addHook(new NoEnterClassDeclarationHook());
                functionBodyTraverser.addHook(new NoEnterClassExpressionHook());
                functionBodyTraverser.addHook(new NoEnterArrowFunctionExpressionHook());
                functionBodyTraverser.traverse();
                if (!h.hasReturn) {
                    // if there is no return statement in the function body
                    node_.body.push(BlockStatementHook.genFinishFnWrapper(ctx));
                }
                break;
        }
        return node_;
    }

    preHandler(node: Node, parent: Node, key: string): boolean {
        return true;
    }

    private static genFinishFnWrapper(ctx: Context): ExpressionStatement {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": WrapperNames.FinishFn.name,
                },
                "arguments": [
                    genContext(ctx),
                ]
            }
        };
    }

    private static genStartFnWrapper(ctx: Context, params: Identifier[]): ExpressionStatement {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": WrapperNames.StartFn.name,
                },
                "arguments": [
                    genContext(ctx),
                    {
                        "type": "ArrayExpression",
                        "elements": params,
                    },
                    {
                        "type": "Identifier",
                        "name": "arguments",
                    }
                ]
            }
        };
    }

    /**
     * this helper function is used to collect all the declared variables in the given node
     * @param node
     * @return a list of Identifiers that are declared in the given node
     */
    public static collectDeclarator(node: Identifier | ObjectExpression | ObjectPattern | ArrayExpression | ArrayPattern | AssignmentPattern): Identifier[] {
        function handleObject(node: ObjectPattern | ObjectExpression): Identifier[] {
            let ids: Identifier[] = [];
            for (let property of node.properties) {
                if (property.shorthand) {
                    if (property.key.type !== "Identifier") {
                        throw new SupportiveException(property.key, "do not support non-identifier in ObjectPattern");
                    }
                    ids.push(property.key);
                } else {
                    switch (property.value.type) {
                        // @ts-ignore
                        case "ObjectPattern":
                        case "ObjectExpression":
                            ids.push(...handleObject(property.value));
                            break;
                        // @ts-ignore
                        case "ArrayPattern":
                        case "ArrayExpression":
                            throw new SupportiveException(property.key, "do not support ArrayExpression yet");
                        case "Identifier":
                            ids.push(property.value);
                            break;
                        default:
                            throw new SupportiveException(property.key, "do not support Other Expression in VariableDeclarator yet")
                    }
                }
            }
            return ids;
        }

        function handleArray(node: ArrayPattern | ArrayExpression): Identifier[] {
            let ids: Identifier[] = [];
            for (let element of node.elements) {
                if (element === null) {
                    continue;
                }
                switch (element.type) {
                    case "Identifier":
                        ids.push(element);
                        break;
                    case "ArrayPattern":
                        ids.push(...handleArray(element));
                        break;
                    case "ObjectPattern":
                        ids.push(...handleObject(element));
                        break;
                    default:
                        throw new SupportiveException(element, "do not support Other Expression in Declarator yet");

                }
            }
            return ids
        }

        let ids: Identifier[] = [];
        switch (node.type) {
            case "Identifier":
                ids.push(node);
                break;
            case "AssignmentPattern":
                ids.push(...BlockStatementHook.collectDeclarator(node.left));
                break;
            case "ArrayExpression":
            case "ArrayPattern":
                ids.push(...handleArray(node));
                break;
            case "ObjectExpression":
            case "ObjectPattern":
                ids.push(...handleObject(node));
                break
        }
        return ids;
    }

};