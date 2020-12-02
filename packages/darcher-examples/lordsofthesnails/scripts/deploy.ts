import {Config} from "@darcher/config";
import {loadConfig} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import {startCluster} from "./start-blockchain";
import {mainAccountAddress} from "./config/lordsofthesnails.config";
import * as fs from "fs";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import {NodePath} from "@babel/core";
import generate from "@babel/generator";

async function deploy(config: Config) {
    const cluster = await startCluster(config, true);

    // deploy contracts
    child_process.spawnSync(
        "oz",
        ["deploy", "-k", "regular", "-n", "development", "-f", mainAccountAddress, "LordsOfTheSnails"], {
            cwd: path.join(__dirname, "..", "contracts"),
            stdio: "inherit"
        });

    await cluster.stop();

    // load deployment result json
    const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "contracts", ".openzeppelin", "dev-2020.json"), {encoding: "utf-8"}));
    const contracts = deployment["proxies"]["lordsofthesnails/LordsOfTheSnails"];
    const address = contracts[contracts.length - 1]["address"];

    // fill into dapp
    const targetFile = path.join(__dirname, "..", "lordsofthesnails", "lords_snails.js");
    const code = fs.readFileSync(targetFile, {encoding: "utf-8"});
    const ast = parser.parse(code);
    traverse(ast, {
        VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
            if (t.isIdentifier(path.node.id) &&
                (path.node.id as t.Identifier).name === "contractAddress") {
                path.node.init = t.stringLiteral(address);
            }
        }
    });
    const result = generate(ast, {}, code);
    fs.writeFileSync(targetFile, result.code);
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "config", "lordsofthesnails.config.ts")).then(async config => {
        await deploy(config);
    });
}

