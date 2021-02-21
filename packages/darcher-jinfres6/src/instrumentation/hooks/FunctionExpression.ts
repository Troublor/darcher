import InstrumentHook from "./InstrumentHook";
import {FunctionExpression, Identifier, MethodDefinition, Node} from "../ast/types";
import FnNameStack from "../tools/FnNameStack";
import {SupportiveException} from "../exceptions/SupportiveException";

export default class FunctionExpressionHook implements InstrumentHook {
    getHookNodeType(): string {
        return "FunctionExpression";
    }

    /**
     * functionality:
     * 1. if the function do not have a name, allocate a name for it. The name is generated in preHandler and pushed to FnNameStack
     * @param node
     * @param parent
     * @param key
     */
    postHandler(node: Node, parent: Node, key: string): Node | Node[] {
        let node_ = <FunctionExpression>node;
        let fnName = FnNameStack.v().pop();
        if (node_.id === null) {
            // if parent is MethodDefinition, it's useless to give a name to FunctionExpression
            // if the function does not have a name, then the name must has been generated in preHandler
            node_.id = <Identifier>{
                type: "Identifier",
                name: fnName,
            };
        }
        return node_;
    }

    /**
     * functionality:
     * 1. if the function expression do not have function name, generate one and push to FnNameStack. (the name is not given to function yet, which will be done in postHandler)
     * 2. we assume class methods must have name and use this.method as function reference to push to FnNameStack
     * 3. class constructor is ignored
     * 4. normal function's name is pushed to FnNameStack
     * @param node
     * @param parent
     * @param key
     */
    preHandler(node: Node, parent: Node, key: string): boolean {
        // give every function a name, and push the name in the FnNameStack
        let node_ = <FunctionExpression>node;
        let fnName: string;
        if (parent.type === "MethodDefinition") {
            let parent_: MethodDefinition = <MethodDefinition>parent;
            if (parent_.key.type !== "Identifier") {
                // so far every MethodDefinition's key is Identifier,
                // throw exception if key is not Identifier
                throw new SupportiveException(parent_, "MethodDefinition key is not Identifier, unsupported");
            }
            if (parent_.kind === 'constructor') {
                // constructor do not have a name, so push null to the FnNameStack
                fnName = null;
            } else {
                // in the class, method reference should be this.methodName
                fnName = `this.${parent_.key.name}`;
            }
        } else if (node_.id === null) {
            // if the function expression does not have a name, then generate one for it
            fnName = FnNameStack.genFnName();
            // push the fnName to the stack, the function name will be added to the node in postHandler
        } else {
            // if the function already has a name
            fnName = node_.id.name;
        }
        FnNameStack.v().push(fnName);
        return true;
    }

}