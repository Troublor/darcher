import InstrumentHook from "./InstrumentHook";
import {Identifier, Node, Program, VariableDeclaration} from "../ast/types";
import FnNameStack from "../tools/FnNameStack";
import WrapperNames from "../../runtime/wrappers/names";

export default class ProgramHook implements InstrumentHook {
    private runtimeLibPath: string;

    constructor(runtimeLibPath: string) {
        this.runtimeLibPath = runtimeLibPath;
    }

    getHookNodeType(): string {
        return "Program";
    }

    /**
     * functionality:
     * 1. add require statement (the wrapper functions) at the first line of program
     * 2. pop a function name (null here because this is a program) which is pushed in preHandler
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        // add require statements of runtime wrappers
        let node_ = <Program>node;
        node_.body.unshift(this.genRequireStatement());
        // pop the function name stack
        FnNameStack.v().pop();
        return node;
    }

    /**
     * functionality:
     * 1. push a null to FnNameStack because this is a program, not a part of any function
     * @param node
     * @param parent
     * @param key
     */
    preHandler(node: Node, parent: Node, key: string): boolean {
        // push null to Function name stack
        FnNameStack.v().push(null);
        return true;
    }

    private genRequireStatement(): VariableDeclaration {
        let properties = [];
        for (let key of Object.keys(WrapperNames)) {
            let identifier: Identifier = {
                type: "Identifier",
                // @ts-ignore
                name: WrapperNames[key].name,
            };
            properties.push({
                type: "Property",
                key: identifier,
                computed: false,
                value: identifier,
                kind: "init",
                method: false,
                shorthand: true,
            });
        }
        return <VariableDeclaration>{
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "ObjectPattern",
                        "properties": properties,
                    },
                    "init": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "Identifier",
                                "name": "require"
                            },
                            "arguments": [
                                {
                                    "type": "Literal",
                                    "value": this.runtimeLibPath,
                                    "raw": `"${this.runtimeLibPath}"`
                                }
                            ]
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "runtime"
                        }
                    }
                }
            ],
            "kind": "let"
        };
    }

};