/**
 * This file defines several functions using babel to instrument tx trace in libraries
 */

import * as fs from "fs";

import * as parser from '@babel/parser';
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import {
    AssignmentExpression, CallExpression,
    FunctionExpression,
    Identifier,
    MemberExpression, Statement, VariableDeclaration, VariableDeclarator
} from "@babel/types";
import {NodePath} from "@babel/core";
import template from "@babel/template";
import * as path from "path";
import {Logger} from "@darcher/helpers";
import prompts = require("prompts");

/**
 *
 * @param file
 * @return already instrumented, instrumented
 */
function _instrumentWeb3CoreMethod(file: string, instrumentedPack: string): [boolean, boolean] {
    let instrumented = false;
    const code = fs.readFileSync(file).toString("utf-8");
    const ast = parser.parse(code);
    let already = false;
    traverse(ast, {
        AssignmentExpression(path: NodePath<AssignmentExpression>, state) {
            if (path.node.left.type === 'MemberExpression') {
                const left = path.node.left as MemberExpression;
                if (left.property.type === 'Identifier') {
                    const property = left.property as Identifier;
                    if (property.name === "buildCall") {
                        const right = path.node.right as FunctionExpression;
                        for (const statement of right.body.body) {
                            if (statement.type === 'VariableDeclaration') {
                                const declaration = statement as VariableDeclaration;
                                for (const declarator of declaration.declarations) {
                                    if ((declarator as VariableDeclarator).id.type === 'Identifier' &&
                                        (declarator.id as Identifier).name === 'send') {
                                        const func = declarator.init as FunctionExpression;
                                        let i = 0;
                                        let loc = undefined;
                                        for (const statement of func.body.body) {
                                            if (loc === undefined && statement.type === 'IfStatement') {
                                                loc = i;
                                            }
                                            if (statement.type === 'ExpressionStatement' &&
                                            statement.expression.type === 'AssignmentExpression' &&
                                            statement.expression.right.type === 'CallExpression' &&
                                            statement.expression.right.callee.type === 'Identifier' &&
                                            statement.expression.right.callee.name === 'traceSendAsync') {
                                                already = true;
                                            }
                                            i++;
                                        }
                                        if (loc !== undefined && !already) {
                                            const buildRequire = template(`
                                              const {traceSendAsync} = require("./trace-instrument");
                                              sendTxCallback = traceSendAsync(method.call, payload.params, sendTxCallback);
                                            `);
                                            const ast = buildRequire();
                                            func.body.body = [...func.body.body.slice(0, loc), ...ast as Statement[], ...func.body.body.slice(loc)];
                                            instrumented = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (instrumented) {
        const result = generate(ast, {}, code);
        // save previous one as a copy
        fs.writeFileSync(file + ".pre-instrument", code);
        // copy instrumented module
        fs.copyFileSync(instrumentedPack, path.join(path.dirname(file), "trace-instrument.js"));
        // saved instrumented code
        fs.writeFileSync(file, result.code);
    }else if (already) {
        // copy instrumented module
        fs.copyFileSync(instrumentedPack, path.join(path.dirname(file), "trace-instrument.js"));
    }
    return [already, instrumented];
}

export function instrumentWeb3CoreMethod(dir: string, type: "web" | "node") {
    const scanDirForDir = function (root: string, target: string, callback: (folder: string) => void) {
        for (const directory of fs.readdirSync(root)) {
            if (directory === "coverage") {
                continue;
            }
            if (directory === target) {
                callback(path.join(root, directory));
            }
            if (fs.statSync(path.join(root, directory)).isDirectory()) {
                scanDirForDir(path.join(root, directory), target, callback);
            }
        }
    }

    const logger = new Logger("web3-core-method.instrument", 'info')

    scanDirForDir(dir, "web3-core-method", folder => {
        const indexFile = path.join(folder, "src", "index.js");
        if (fs.existsSync(indexFile)) {
            let instrumentedPack;
            if (type === 'web') {
                instrumentedPack = path.join(__dirname, "..", "bundle", "trace-instrument.web.js");
            }else if (type === 'node') {
                instrumentedPack = path.join(__dirname, "..", "bundle", "trace-instrument.node.js");
            }
            const [already, instrumented] = _instrumentWeb3CoreMethod(indexFile, instrumentedPack);
            if (already) {
                logger.warn("already instrumented " + indexFile);
            } else if (instrumented) {
                logger.info("instrumented " + indexFile);
            } else {
                logger.warn("not instrument " + indexFile);
            }
        } else {
            logger.warn(`find web3-core-method at ${folder}, but no src/index.js detected`);
        }
    })
}

if (require.main === module) {
    (async () => {
        const response1 = await prompts({
            type:"select",
            name:"type",
            message:"Web or Node.js?",
            choices:[
                {title: "Web", value: 'web'},
                {title: "Node.js", value: "node"},
            ]
        });
        const response0 = await prompts({
            type: "text",
            name: "dir",
            message: "Root dir to instrument?",
            validate: prev => fs.existsSync(prev) && fs.statSync(prev).isDirectory(),
        });
        if (response0.dir) {
            instrumentWeb3CoreMethod(response0.dir, response1.type);
        }
    })()
}
