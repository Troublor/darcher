import AstTraverser from "../src/instrumentation/traverser";
import {ClassDeclaration, ExpressionStatement, Program} from "../src/instrumentation/ast/types";
import FunctionDeclarationHook from "../src/instrumentation/hooks/FunctionDeclarationHook";
import {InternalError, InternalErrorType} from "../src/instrumentation/exceptions/InternalError";
import {expect} from "chai"

const chai = require("chai");

describe("internalError testing", () => {
    it('should throw InternalError when add duplicate hooks', function () {
        let traverser = new AstTraverser(<Program>{type: "Program"});
        traverser.addHook(new FunctionDeclarationHook());
        expect(() => traverser.addHook(new FunctionDeclarationHook())).to.throw(InternalError);
    });

    it('should return original ast', function () {
        let ast = {
            "type": "Program",
            "body": [
                <ClassDeclaration>{
                    "type": "ClassDeclaration",
                    "id": {
                        "type": "Identifier",
                        "name": "T"
                    },
                    "superClass": null,
                    "body": {
                        "type": "ClassBody",
                        "body": [
                            {
                                "type": "MethodDefinition",
                                "key": {
                                    "type": "Identifier",
                                    "name": "fn"
                                },
                                "computed": false,
                                "value": {
                                    "type": "FunctionExpression",
                                    "id": null,
                                    "params": [],
                                    "body": {
                                        "type": "BlockStatement",
                                        "body": [
                                            {
                                                "type": "ExpressionStatement",
                                                "expression": {
                                                    "type": "CallExpression",
                                                    "callee": {
                                                        "type": "MemberExpression",
                                                        "computed": false,
                                                        "object": {
                                                            "type": "Identifier",
                                                            "name": "console"
                                                        },
                                                        "property": {
                                                            "type": "Identifier",
                                                            "name": "log"
                                                        }
                                                    },
                                                    "arguments": [
                                                        {
                                                            "type": "MemberExpression",
                                                            "computed": false,
                                                            "object": {
                                                                "type": "MemberExpression",
                                                                "computed": false,
                                                                "object": {
                                                                    "type": "ThisExpression"
                                                                },
                                                                "property": {
                                                                    "type": "Identifier",
                                                                    "name": "fn"
                                                                }
                                                            },
                                                            "property": {
                                                                "type": "Identifier",
                                                                "name": "test"
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    },
                                    "generator": false,
                                    "expression": false,
                                    "async": false
                                },
                                "kind": "method",
                                "static": true
                            }
                        ]
                    }
                },
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "Identifier",
                                    "name": "T"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "fn"
                                }
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "test"
                            }
                        },
                        "right": {
                            "type": "Literal",
                            "value": 3,
                            "raw": "3"
                        }
                    }
                },
                <ExpressionStatement>{
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "T"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "fn"
                            }
                        },
                        "arguments": []
                    }
                }
            ],
            "sourceType": "module"
        };
        let traverser = new AstTraverser(ast);
        expect(traverser.traverse()).to.deep.equal(ast);
    });
});