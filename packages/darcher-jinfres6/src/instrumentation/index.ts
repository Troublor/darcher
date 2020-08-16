import AstTraverser from "./traverser";
import ProgramHook from "./hooks/ProgramHook";
import CallExpressionHook from "./hooks/CallExpressionHook";
import WrapperNames from "../runtime/wrappers/names";
import ArrowFunctionExpressionHook from "./hooks/ArrowFunctionExpressionHook";
import FunctionDeclarationHook from "./hooks/FunctionDeclarationHook";
import FunctionExpressionHook from "./hooks/FunctionExpression";
import PropertyHook from "./hooks/PropertyHook";
import BlockStatementHook from "./hooks/BlockStatementHook";
import IfStatementHook from "./hooks/IfStatementHook";
import MemberExpressionHook from "./hooks/MemberExpressionHook";
import {IdentifierHook} from "./hooks/IdentifierHook";
import {ArrayExpressionHook} from "./hooks/ArrayExpressionHook";
import {ThisExpressionHook} from "./hooks/ThisExpressionHook";
import {ObjectExpressionHook} from "./hooks/ObjectExpressionHook";
import {UpdateExpressionHook} from "./hooks/UpdateExpressionHook";
import {UnaryExpressionHook} from "./hooks/UnaryExpressionHook";
import {BinaryExpressionHook} from "./hooks/BinaryExpressionHook";
import {LogicalExpressionHook} from "./hooks/LogicalExpressionHook";

const path = require("path");
const fs = require("fs");

const esprima = require("esprima");
const escodegen = require("escodegen");

export function getRequireStatement(runtimeLibPath: string) {
    let wrappers = [];
    for (let key of Object.keys(WrapperNames)) {
        // @ts-ignore
        wrappers.push(WrapperNames[key].name);
    }
    return `const { ${wrappers.join(", ")} } = require('${runtimeLibPath}');`;
}

export function instrument(code: string, runtimeLibPath: string) {
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
    traverser.addHook(new ProgramHook(runtimeLibPath));
    traverser.addHook(new CallExpressionHook());
    traverser.addHook(new PropertyHook());
    traverser.addHook(new BlockStatementHook());
    traverser.addHook(new MemberExpressionHook());
    traverser.addHook(new ArrowFunctionExpressionHook());
    traverser.addHook(new FunctionDeclarationHook());
    traverser.addHook(new FunctionExpressionHook());
    traverser.addHook(new IfStatementHook());
    // traverser.addHook(new UpdateExpressionHook());
    // traverser.addHook(new UnaryExpressionHook());
    // traverser.addHook(new BinaryExpressionHook());
    ast = traverser.traverse();
    return escodegen.generate(ast);
}

export function instrumentFile(src: string, out: string = src, libPath: string = "jinfres6/runtime"): void {
    // check whether src is a file
    let stat = fs.statSync(src);
    if (stat.isFile()) {
        // check out
        if (fs.existsSync(out) && fs.statSync(out).isDirectory()) {
            out = path.join(out, path.basename(src));
        }
        // check ext. name
        if (path.extname(src).toLowerCase() !== ".js") {
            // throw new Error(`${src} is not javascript file`);
            fs.copyFileSync(src, out);
            return
        } else {
            let content = fs.readFileSync(src);
            try {
                content = instrument(content.toString(), libPath);
                fs.writeFileSync(out, "/* eslint-disable */\n" + content);
                console.log("Instrument success: " + src);
            } catch (e) {
                console.error("Instrument file failed: " + src);
                console.error(e.toString());
                console.error();
            }
        }
    } else {
        throw new Error(`${src} is not a file`);
    }
}

export function instrumentDir(src: string, out: string = src, libPath: string = "jinfres6/runtime", localLib: boolean = false): void {
    let stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (fs.existsSync(out) && fs.statSync(out).isFile()) {
            throw new Error(`${out} is a file, expecting a directory.`)
        }
        if (!fs.existsSync(out)) {
            fs.mkdirSync(out, {recursive: true});
        }
        for (let filename of fs.readdirSync(src)) {
            let stat = fs.statSync(path.join(src, filename));
            if (stat.isFile()) {
                instrumentFile(path.join(src, filename), out, libPath);
            } else if (stat.isDirectory()) {
                if (localLib) {
                    instrumentDir(path.join(src, filename), path.join(out, filename), path.join("..", libPath), localLib);
                } else {
                    instrumentDir(path.join(src, filename), path.join(out, filename), libPath, localLib);
                }
            }
        }
    } else {
        throw new Error(`${src} is not a directory`);
    }
}