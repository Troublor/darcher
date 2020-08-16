import {Config} from "@darcher/config";
import {
    BlockchainCluster,
    Command,
    copyPredefinedAccounts,
    DarcherError,
    DarcherErrorCode,
    getPredefinedAccounts,
    getPredefinedAccountsPasswords,
    getTruffleDeployedContract,
    loadConfig,
    Logger,
    updateJsFile,
    updateJsonFile
} from "@darcher/helpers";
import * as path from "path";
import * as child_process from "child_process";
import InstrumentHook from "@darcher/jinfres6/src/instrumentation/hooks/InstrumentHook";
import {
    AssignmentExpression,
    Literal,
    Node,
    ObjectExpression,
    Property
} from "@darcher/jinfres6/src/instrumentation/ast/types";

export function resetBlockchain(config: Config) {
    let cluster = new BlockchainCluster(config.clusters[0]);
    cluster.reset();
}

export async function deployContracts(config: Config) {
    let logger = new Logger("DemocracyEarth Deploy");
    logger.level = "info";
    // add unlock predefined accounts in cluster extra options
    let predefinedAccounts = getPredefinedAccounts();
    config.clusters[0].extra = ` --allow-insecure-unlock --unlock ${predefinedAccounts.join(",")} --password ${getPredefinedAccountsPasswords()}`;
    let cluster = new BlockchainCluster(config.clusters[0]);
    await cluster.deploy(false);

    let daiAddress = "";
    // deploy dai ERC20
    try {
        logger.info("Deploying DAI...")
        let deployDaiCmd = new Command(`yarn dai:migrate`);
        child_process.execSync(deployDaiCmd.toString(), {
            cwd: path.join(__dirname, "..", "tokens")
        });
        let deployed = getTruffleDeployedContract(path.join(__dirname, "..", "tokens", "DAI", "build", "contracts", "Dai.json"));
        let networkId = config.clusters[0].networkId;
        if (!deployed.deployment.hasOwnProperty(networkId)) {
            throw new Error("Dai not deployed on network" + networkId);
        }
        daiAddress = deployed.deployment[networkId].address;
        logger.info(`DAI deployed, address=${daiAddress}`);
        // fill abi and address in sovereign
        updateJsonFile(path.join(__dirname, "..", "sovereign", "private", "lib", "token.json"),
            (obj: { coin: [{ code: string, abi?: string, contractAddress: string }] }) => {
                let coins = obj["coin"];
                for (let coin of coins) {
                    if (coin.code === "DAI") {
                        coin.abi = JSON.stringify(deployed.abi);
                        coin.contractAddress = deployed.deployment[networkId].address;
                    }
                }
                return obj;
            });
        updateJsonFile(path.join(__dirname, "..", "sovereign", "public", "templates", "daoverse", "lib", "token.json"),
            (obj: { coin: [{ code: string, abi?: string, contractAddress: string }] }) => {
                let coins = obj["coin"];
                for (let coin of coins) {
                    if (coin.code === "DAI") {
                        coin.abi = JSON.stringify(deployed.abi);
                        coin.contractAddress = deployed.deployment[networkId].address;
                    }
                }
                return obj;
            });
        logger.info("DAI abi and address filled in private/lib/token.json and public/templates/daoverse/lib/token.json");
    } catch (e) {
        logger.error(new DarcherError(DarcherErrorCode.Raw, `Deploy DAI contract error: ${e}`));
        await cluster.stop();
        return;
    }

    // deploy WETH ERC20
    try {
        logger.info("Deploying WETH...")
        let deployCmd = new Command(`yarn weth:migrate`);
        child_process.execSync(deployCmd.toString(), {
            cwd: path.join(__dirname, "..", "tokens")
        });
        let deployed = getTruffleDeployedContract(path.join(__dirname, "..", "tokens", "WETH", "build", "contracts", "WETH9.json"));
        let networkId = config.clusters[0].networkId;
        if (!deployed.deployment.hasOwnProperty(networkId)) {
            throw new Error("WETH not deployed on network" + networkId);
        }
        logger.info(`WETH deployed, address=${deployed.deployment[networkId].address}`);
        // fill abi and address in sovereign
        updateJsonFile(path.join(__dirname, "..", "sovereign", "private", "lib", "token.json"),
            (obj: { coin: [{ code: string, abi?: string, contractAddress: string }] }) => {
                let coins = obj["coin"];
                for (let coin of coins) {
                    if (coin.code === "WETH") {
                        coin.abi = JSON.stringify(deployed.abi);
                        coin.contractAddress = deployed.deployment[networkId].address;
                    }
                }
                return obj;
            });
        updateJsonFile(path.join(__dirname, "..", "sovereign", "public", "templates", "daoverse", "lib", "token.json"),
            (obj: { coin: [{ code: string, abi?: string, contractAddress: string }] }) => {
                let coins = obj["coin"];
                for (let coin of coins) {
                    if (coin.code === "WETH") {
                        coin.abi = JSON.stringify(deployed.abi);
                        coin.contractAddress = deployed.deployment[networkId].address;
                    }
                }
                return obj;
            });
        logger.info("WETH abi and address filled in private/lib/token.json and public/templates/daoverse/lib/token.json");
    } catch (e) {
        logger.error(new DarcherError(DarcherErrorCode.Raw, `Deploy WETH contract error: ${e}`));
        await cluster.stop();
        return;
    }

    // deploy DemocracyEarthDAO
    try {
        logger.info("Deploying DemocracyDAO - Moloch DAO...")

        // set summoner (account 0 of predefined accounts) and approved token (DAI)
        /**
         * Used to fill summoner and token address in DemocracyDAO/deployment-params.js
         */
        class DeploymentParamsHook implements InstrumentHook {
            constructor(private summoner: string, private token: string) {
            }

            getHookNodeType(): string {
                return "AssignmentExpression";
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                let _node = <AssignmentExpression>node;
                if (_node.left.type === "MemberExpression" &&
                    _node.left.property.type === "Identifier" &&
                    _node.left.property.name === "SUMMONER") {
                    _node.right = <Literal>{
                        "type": "Literal",
                        "value": this.summoner,
                        "raw": `'${this.summoner}'`,
                    }
                } else if (_node.left.type === "MemberExpression" &&
                    _node.left.property.type === "Identifier" &&
                    _node.left.property.name === "TOKEN") {
                    _node.right = <Literal>{
                        "type": "Literal",
                        "value": this.token,
                        "raw": `'${this.token}'`,
                    }
                }
                return _node;
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                return true;
            }

        }

        logger.info(`Using SUMMON ${predefinedAccounts[0]}`);
        logger.info(`Using TOKEN DAI`);
        // fill SUMMONER and TOKEN in DemocracyDAO/deployment-params.js
        updateJsFile(
            path.join(__dirname, "..", "DemocracyDAO", "deployment-params.js"),
            new DeploymentParamsHook(predefinedAccounts[0], daiAddress)
        );
        logger.info("SUMMONER and TOKEN filled in deployment-params.js");

        /**
         * This instrumentHook is used to update testnet config in buidler.config.js
         */
        class BuidlerConfigHook implements InstrumentHook {
            constructor(private networkRPCUrl: string, private molochAddress: string) {
            }

            getHookNodeType(): string {
                return "Property";
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                let _node = <Property>node;
                if (_node.key.type === "Identifier" &&
                    _node.key.name === "testnet" &&
                    _node.value.type === "ObjectExpression") {
                    for (let property of _node.value.properties) {
                        if (property.key.type === "Identifier" &&
                            property.key.name === "url") {
                            // fill url
                            property.value = {
                                "type": "Literal",
                                "value": `${this.networkRPCUrl}`,
                                "raw": `"${this.networkRPCUrl}"`,
                            };
                        }
                        if (property.key.type === "Identifier" &&
                            property.key.name === "deployedContracts" &&
                            property.value.type === "ObjectExpression") {
                            // fill deployedContracts
                            for (let p of property.value.properties) {
                                if (p.key.type === "Identifier" &&
                                    p.key.name === "moloch") {
                                    // fill moloch address
                                    p.value = {
                                        "type": "Literal",
                                        "value": `${this.molochAddress}`,
                                        "raw": `"${this.molochAddress}"`,
                                    };
                                }
                            }
                        }
                    }
                }
                return _node;
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                return true;
            }
        }

        // fill the url of testnet config
        let testnetUrl = `http://localhost:${config.clusters[0].httpPort}`;
        updateJsFile(
            path.join(__dirname, "..", "DemocracyDAO", "buidler.config.js"),
            new BuidlerConfigHook(testnetUrl, '')
        );
        logger.info(`Testnet url (${testnetUrl}) filled in buidler.config.js`);

        let deployCmd = new Command(`npx buidler moloch-deploy --network testnet`);
        let output = child_process.execSync(deployCmd.toString(), {
            cwd: path.join(__dirname, "..", "DemocracyDAO")
        });
        // use Regular expression to retrieve moloch address from stdout
        let regExp = /Moloch DAO deployed. Address: (0x[0-9a-fA-F]+)/g;
        let arr = regExp.exec(output.toString());
        if (!arr) {
            throw new Error("Moloch DAO address cannot be retrieved");
        }
        let molochAddress = arr[1];
        if (!molochAddress) {
            throw new Error("Moloch DAO address cannot be retrieved");
        }
        // since DemocracyDAO's deploy script does not write address into Moloch.json like Truffle dose, we can only get abi here.
        let democracyDAODeployed = getTruffleDeployedContract(path.join(__dirname, "..", "DemocracyDAO", "artifacts", "Moloch.json"));

        logger.info(`Moloch DAO deployed, address=${molochAddress}`);

        // fill moloch address in buidler.config.js
        updateJsFile(
            path.join(__dirname, "..", "DemocracyDAO", "buidler.config.js"),
            new BuidlerConfigHook(testnetUrl, molochAddress)
        );
        logger.info("Moloch address filled in buidler.config.js");
        // fill SHARES token address in tokens.json
        updateJsonFile(path.join(__dirname, "..", "sovereign", "private", "lib", "token.json"),
            (obj: { coin: [{ code: string, abi?: string, contractAddress: string }] }) => {
                let coins = obj["coin"];
                for (let coin of coins) {
                    if (coin.code === "SHARES") {
                        coin.contractAddress = molochAddress;
                    }
                }
                return obj;
            });
        updateJsonFile(path.join(__dirname, "..", "sovereign", "public", "templates", "daoverse", "lib", "token.json"),
            (obj: { coin: [{ code: string, abi?: string, contractAddress: string }] }) => {
                let coins = obj["coin"];
                for (let coin of coins) {
                    if (coin.code === "SHARES") {
                        coin.contractAddress = molochAddress;
                    }
                }
                return obj;
            });
        logger.info("Moloch DAO address filled in private/lib/token.json and public/templates/daoverse/lib/token.json")
        // fill DAO address in dao.json and daohaus.json
        updateJsonFile(path.join(__dirname, "..", "sovereign", "private", "lib", "dao.json"),
            (obj: { dao: [{ name: string, profile: { blockchain: { publicAddress: string } } }] }) => {
                let daos = obj["dao"];
                for (let dao of daos) {
                    if (dao.name === "Moloch DAO") {
                        dao.profile.blockchain.publicAddress = molochAddress;
                    }
                }
                return obj;
            });
        updateJsonFile(path.join(__dirname, "..", "sovereign", "private", "lib", "daohaus.json"),
            (obj: { dao: [{ name: string, profile: { blockchain: { publicAddress: string } } }] }) => {
                let daos = obj["dao"];
                for (let dao of daos) {
                    if (dao.name === "Moloch DAO") {
                        dao.profile.blockchain.publicAddress = molochAddress;
                    }
                }
                return obj;
            });
        logger.info("Moloch DAO address filled in private/lib/dao.json and private/lib/daohaus.json")

        /**
         * This hook is used to update abi in sovereign/lib/templates.json
         */
        class TemplatesHook implements InstrumentHook {
            constructor(private daoABI: string/*, private guildBankABI: string*/) {
            }

            getHookNodeType(): string {
                return "ObjectExpression";
            }

            preHandler(node: Node, parent: Node, key: string): boolean {
                return true;
            }

            postHandler(node: Node, parent: Node, key: string): Node | Node[] {
                let _node = node as ObjectExpression;
                if (_node.properties.some(p => {
                    // when this is DAO contract config (have a property label: "DAO"
                    return p.key.type === "Identifier" &&
                        p.key.name === "label" &&
                        p.value.type === "Literal" &&
                        p.value.value === "DAO"
                })) {
                    // update DAO abi
                    for (let p of _node.properties) {
                        if (p.key.type === "Identifier" &&
                            p.key.name === "abi") {
                            p.value = <Literal>{
                                type: "Literal",
                                value: this.daoABI,
                                raw: `'${this.daoABI}'`,
                            };
                        }
                    }
                } /*else if (_node.properties.some(p => {
                    // when this is GuildBank contract config (have a property label: "GuildBank"
                    return p.key.type === "Identifier" &&
                        p.key.name === "label" &&
                        p.value.type === "Literal" &&
                        p.value.value === "GuildBank"
                })) {
                    // update DAO abi
                    for (let p of _node.properties) {
                        if (p.key.type === "Identifier" &&
                            p.key.name === "abi") {
                            p.value = <Literal>{
                                type: "Literal",
                                value: this.guildBankABI,
                                raw: `'${this.guildBankABI}'`,
                            };
                        }
                    }
                }*/
                return _node;
            }
        }

        // fill DAO abi in sovereign/lib/templates.js
        updateJsFile(
            path.join(__dirname, "..", "sovereign", "lib", "templates.js"),
            new TemplatesHook(JSON.stringify(democracyDAODeployed.abi)),
        );
        logger.info("Moloch DAO abi filled in lib/templates.json");

        logger.info("DemocracyEarth finish deployment");

    } catch (e) {
        console.error("Deploy DemocracyDAO contract error:", e);
        await cluster.stop();
        return;
    }
}

if (require.main === module) {
    loadConfig(path.join(__dirname, "..", "config", "sovereign.config.ts")).then(async config => {
        // copy predefined accounts
        for (let clusterConfig of config.clusters) {
            copyPredefinedAccounts(clusterConfig.keyStoreDir);
        }
        resetBlockchain(config);
        await deployContracts(config);
    });
}