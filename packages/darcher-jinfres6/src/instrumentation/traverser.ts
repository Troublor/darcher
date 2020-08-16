import {Node} from "./ast/types";
import {DelegateMismatchError, InternalError, InternalErrorType} from "./exceptions/InternalError";
import {isAstNode} from "./tools/utils";
import UnusualCaseException from "./exceptions/UnusualCaseError";
import InstrumentHook from "./hooks/InstrumentHook";
import {InstrumentException} from "./exceptions/InstrumentException";

export default class AstTraverser {
    // hooks for each type of AST node
    private readonly hooks: { [type: string]: InstrumentHook };

    // the root of the AST to traverse
    private readonly root: Node;

    public constructor(root: Node) {
        if (!isAstNode(root)) {
            throw new InstrumentException(root, "not a valid AST node");
        }
        this.root = root;
        this.hooks = {};
    }

    /**
     * traverseArray traverses an array in the AST
     * @param arr: the array to be traversed
     * @param parent: the parent node of the array
     * @param key: the key of the array in the parent node
     * @return Node[]: the new array to replace the original array in the parent node
     */
    private traverseArray(arr: Node[], parent: Node, key: string): Node[] {
        let return_arr = [];
        for (let value of arr) {
            if (Array.isArray(value)) {
                return_arr.push(value);
                // usually there shouldn't be another array when traversing one array
                throw new UnusualCaseException("continuous array when traversing");
            } else if (isAstNode(value)) {
                let result = this.traverseObject(value, parent, key);
                if (Array.isArray(result)) {
                    // if the traverseObject returned value is an array, extract it and add to the original array
                    return_arr.push(...result);
                } else {
                    return_arr.push(result);
                }
            } else {
                return_arr.push(value);
            }
        }
        return return_arr;
    }

    /**
     * traverseObject traverses all properties of a node object in the AST
     * @param obj: the node object to be traversed
     * @param parent: the parent node of the node object
     * @param key: the key of the node object in the parent node
     * @return Node: The new node to replace the original node object in the parent node
     */
    private traverseObject(obj: Node, parent: Node | null, key: string | null): Node | Node[] {
        // return if obj is not a AST node
        if (!isAstNode(obj)) {
            return obj;
        }

        let hook: InstrumentHook = null;

        // find corresponding hook
        if (obj.type in this.hooks) {
            hook = this.hooks[obj.type];
        }

        // execute preDelegate hooks
        if (hook !== null) {
            let proceed = hook.preHandler(obj, parent, key);
            if (!proceed) {
                // if the result of preDelegate shows not to proceed
                return obj;
            }
        }

        // traverse all properties of the object
        let _parent = obj;
        for (let k of Object.keys(obj)) {
            // @ts-ignore
            let value = <Node>obj[k];
            if (Array.isArray(value)) {
                // @ts-ignore
                obj[k] = this.traverseArray(value, _parent, k);
            } else if (isAstNode(value)) {
                // @ts-ignore
                obj[k] = this.traverseObject(value, _parent, k);
            }
        }

        // execute postDelegate hooks
        if (hook !== null) {
            let result = hook.postHandler(obj, parent, key);
            if (key !== "body" && key !== "consequent" && Array.isArray(result)) {
                // body and consequence properties can have either array value or object value
                // otherwise this is an error in the Hook implementation
                throw new DelegateMismatchError(result, obj, parent, key);
            }
            return result;
        }
        return obj
    }

    /**
     * start traverse the given ast with provided hooks
     * @return Node | Node[]: the ast after traversing
     */
    public traverse(): Node | Node[] {
        return this.traverseObject(this.root, null, null);
    }

    /**
     * add a hook for specific type of AST node
     * @param type: AST node type
     * @param hook: IHook instance
     */
    public addHook(hook: InstrumentHook) {
        let type = hook.getHookNodeType();
        if (type in this.hooks) {
            throw new InternalError(InternalErrorType.UNIQUE_VIOLATION, `hook for ${type} already exists`);
        }
        this.hooks[type] = hook;
    }
}