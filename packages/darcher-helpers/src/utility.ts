import {Config} from "@darcher/config";
import * as path from "path";
import * as fs from "fs";
import InstrumentHook from "@darcher/jinfres6/src/instrumentation/hooks/InstrumentHook";
import AstTraverser from "@darcher/jinfres6/src/instrumentation/traverser";
import ProgramHook from "@darcher/jinfres6/src/instrumentation/hooks/ProgramHook";
import CallExpressionHook from "@darcher/jinfres6/src/instrumentation/hooks/CallExpressionHook";
import PropertyHook from "@darcher/jinfres6/src/instrumentation/hooks/PropertyHook";
import BlockStatementHook from "@darcher/jinfres6/src/instrumentation/hooks/BlockStatementHook";
import MemberExpressionHook from "@darcher/jinfres6/src/instrumentation/hooks/MemberExpressionHook";
import ArrowFunctionExpressionHook from "@darcher/jinfres6/src/instrumentation/hooks/ArrowFunctionExpressionHook";
import FunctionDeclarationHook from "@darcher/jinfres6/src/instrumentation/hooks/FunctionDeclarationHook";
import FunctionExpressionHook from "@darcher/jinfres6/src/instrumentation/hooks/FunctionExpression";
import IfStatementHook from "@darcher/jinfres6/src/instrumentation/hooks/IfStatementHook";

let id = 0;

export function getUUID(): string {
    let ret = id.toString();
    id++;
    return ret;
}

export type PromiseKit<T> = {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

export const sleep: (ms: number) => Promise<void> = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function prettifyHash(hash: string): string {
    let startIndex = 0;
    if (hash.startsWith("0x")) {
        startIndex = 2;
    }
    return `${hash.substring(startIndex, startIndex + 6)}…${hash.substring(hash.length - 6, hash.length)}`;
}

export async function loadConfig(configPath: string): Promise<Config> {
    async function loadScript(path: string): Promise<Config> {
        let module = await import(path);
        return module.default as Config;
    }

    async function loadJson(path: string): Promise<Config> {
        let content = fs.readFileSync(path);
        return JSON.parse(content.toString()) as Config
    }

    let ext = path.extname(configPath);
    switch (ext) {
        case ".ts":
        case ".tsx":
        case ".js":
        case ".jsx":
            return loadScript(configPath);
        default:
            return loadJson(configPath);
    }

}

/**
 * Update the content in a json file, according to the rules defined by updateFunc.
 * If the json file does not exist, it will be created.
 * An error will be thrown if the file is not valid json.
 * @param jsonFilePath
 * @param updateFunc a function which takes an undefined (if the json file does not exist) or object (parsed from json file),
 *        returns an object which will be stringified and saved in the json file.
 */
export function updateJsonFile(jsonFilePath: string, updateFunc: (obj: undefined | object) => object) {
    let obj = undefined;
    if (fs.existsSync(jsonFilePath)) {
        obj = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    }
    obj = updateFunc(obj);

    fs.writeFileSync(jsonFilePath, JSON.stringify(obj, null, 2));
}

/**
 * This function leverage @darcher/jinfres6 instrumentHook to update js file (typescript is not supported).
 * If file does not exist or is not a valid js file, an error will be thrown.
 * @param jsFilePath
 * @param instrumentHooks
 */
export function updateJsFile(jsFilePath: string, ...instrumentHooks: InstrumentHook[]) {
    const esprima = require("esprima");
    const escodegen = require("escodegen");
    if (!fs.existsSync(jsFilePath)) {
        throw new Error(`${jsFilePath} does not exist`);
    }
    let code = fs.readFileSync(jsFilePath, 'utf8');
    const config = {
        jsx: true,
        range: false,
        loc: false,
        tolerant: false,
        tokens: false,
        comment: false,
    };
    let ast = esprima.parseModule(code, config);
    let traverser = new AstTraverser(ast);
    for (let hook of instrumentHooks) {
        traverser.addHook(hook);
    }
    ast = traverser.traverse();
    code = escodegen.generate(ast);
    fs.writeFileSync(jsFilePath, code);
}