import {AnalyzerConfig, ClusterConfig, DBMonitorConfig, DBOptions} from "@darcher/config";
import * as shell from "shelljs";
import * as path from "path";
import * as getPort from "get-port";
import {Command, Tab, TerminalWindow} from "./terminal";
import {spawn} from "child_process";
import {sleep} from "./utility";
import axios from "axios";
import {ETHMONITOR_PATH, GETH_PATH} from "./defines";
import * as fs from "fs";

// this script starts ethmonitor clusters according to the config in @darcher/config

/**
 * Blockchain Cluster consists of a Ethmonitor and two geth nodes (DOER and TALKER).
 * A cluster acts as a whole blockchain network to handle Ethereum transactions with reorganization features.
 */
export class BlockchainCluster {
    private readonly config: ClusterConfig;

    private ethmonitorPID: number;
    private doerPID: number;
    private talkerPID: number;

    /**
     * The cluster is constructed with cluster configurations
     * @param config ClusterConfig defined in @darcher/config
     */
    constructor(config: ClusterConfig) {
        this.config = config;
    }

    private static testAndMakeDir(path: string): boolean {
        if (!shell.test("-d", path)) {
            // dir does not exist
            shell.mkdir(path);
            if (shell.error()) {
                return false;
            }
        }
        return true
    }

    /**
     * Reset the cluster, delete all data in the blockchain and re-initialize the blockchain
     */
    public reset(): boolean {
        if (!BlockchainCluster.testAndMakeDir(this.config.dir)) {
            console.error(`mkdir ${this.config.dir} failed`);
            return false;
        }
        let doerDir = path.join(this.config.dir, "doer");
        if (!BlockchainCluster.testAndMakeDir(doerDir)) {
            console.error(`mkdir ${doerDir} failed`);
            return false;
        }
        let talkerDir = path.join(this.config.dir, "talker");
        if (!BlockchainCluster.testAndMakeDir(talkerDir)) {
            console.error(`mkdir ${talkerDir} failed`);
            return false;
        }

        // check if genesis file exists
        if (!shell.test("-f", this.config.genesisFile)) {
            console.error(`genesis file ${this.config.genesisFile} not found`);
            return false;
        }

        // delete previous data
        shell.rm("-rf", path.join(doerDir, "geth"), path.join(doerDir, "history"));
        shell.rm("-rf", path.join(talkerDir, "geth"), path.join(talkerDir, "history"));

        // re-initialize doer
        let cmd1 = new Command(`yarn workspace @darcher/go-ethereum start:geth`);
        cmd1.append(`--datadir ${doerDir}`);
        cmd1.append(`init`);
        cmd1.append(this.config.genesisFile);
        shell.exec(cmd1.toString());

        // re-initialize talker
        let cmd2 = new Command(`yarn workspace @darcher/go-ethereum start:geth`);
        cmd2.append(`--datadir ${talkerDir}`);
        cmd2.append(`init`);
        cmd2.append(this.config.genesisFile);
        shell.exec(cmd2.toString());

        return true;
    }

    /**
     * Start the blockchain cluster in a deployment mode. Development mode will open clusters with nodes always connected and without ethmonitor.
     * @param background start in the background
     * @return if start in background, return value will be a promise of PIDs of ethmonitor, doer and talker; otherwise return promise of boolean.
     */
    public async deploy(background: boolean = false): Promise<boolean | { doerPID: number, talkerPID: number }> {
        if (!BlockchainCluster.testAndMakeDir(this.config.dir)) {
            console.error(`mkdir ${this.config.dir} failed`);
            return false;
        }
        let doerDir = path.join(this.config.dir, "doer");
        if (!BlockchainCluster.testAndMakeDir(doerDir)) {
            console.error(`mkdir ${doerDir} failed`);
            return false;
        }
        let talkerDir = path.join(this.config.dir, "talker");
        if (!BlockchainCluster.testAndMakeDir(talkerDir)) {
            console.error(`mkdir ${talkerDir} failed`);
            return false;
        }

        // create an already connected private network
        let cmdDoer = new Command(GETH_PATH)
        cmdDoer.append(`--verbosity ${this.config.verbosity ? this.config.verbosity : 3}`)
        cmdDoer.append(`--datadir ${doerDir}`);
        cmdDoer.append(`--keystore ${this.config.keyStoreDir}`);
        if (this.config.networkId) {
            cmdDoer.append(`--networkid ${this.config.networkId}`);
        }
        cmdDoer.append(`--port ${await getPort({port: getPort.makeRange(30300, 30399)})}`);
        cmdDoer.append(`--nodiscover`);
        cmdDoer.append(`--ipcdisable`);
        if (this.config.httpPort) {
            cmdDoer.append(`--http -http.api web3,admin,miner,eth,txpool,net --http.port ${this.config.httpPort} --http.corsdomain='*'`);
        }
        if (this.config.wsPort) {
            cmdDoer.append(`--ws --wsport ${this.config.wsPort} --wsorigins "*"`);
        }
        if (this.config.graphql) {
            cmdDoer.append(`--graphql`);
        }
        cmdDoer.append(`--syncmode full`);
        cmdDoer.append(`--miner.mineWhenTx`);
        if (this.config.extra) {
            cmdDoer.append(this.config.extra);
        }
        if (!background) {
            cmdDoer.append(`console`);
        }

        let cmdTalker = new Command(GETH_PATH);
        cmdTalker.append(`--verbosity ${this.config.verbosity ? this.config.verbosity : 3}`)
        cmdTalker.append(`--datadir ${talkerDir}`);
        cmdTalker.append(`--keystore ${this.config.keyStoreDir}`);
        if (this.config.networkId) {
            cmdTalker.append(`--networkid ${this.config.networkId}`);
        }
        cmdTalker.append(`--port ${await getPort({port: getPort.makeRange(30300, 30399)})}`);
        // we generate a http port for talker in order to add peer dynamically
        let talkerHttpPort = await getPort({port: getPort.makeRange(30300, 30399)})
        cmdTalker.append(`--http -http.api admin --http.port ${talkerHttpPort} --http.corsdomain='*'`);
        cmdTalker.append(`--nodiscover`);
        cmdTalker.append(`--ipcdisable`);
        cmdTalker.append(`--syncmode full`);
        if (!background) {
            cmdTalker.append(`console`);
        }

        let returned: boolean | { doerPID: number, talkerPID: number };

        if (background) {
            // open in the background
            let doerProcess = spawn(cmdDoer.command, cmdDoer.args, {
                stdio: ['ignore', 'ignore', 'ignore'],
                detached: true,
            });
            doerProcess.unref();
            let talkerProcess = spawn(cmdTalker.command, cmdTalker.args, {
                stdio: ['ignore', 'ignore', 'ignore'],
                detached: true,
            });
            talkerProcess.unref();
            this.doerPID = doerProcess.pid;
            this.talkerPID = talkerProcess.pid;
            returned = {
                doerPID: doerProcess.pid,
                talkerPID: talkerProcess.pid,
            }
        } else {
            let tab1 = new Tab(cmdDoer, false, undefined, `DOER-${this.config.ethmonitorPort}`);
            let tab2 = new Tab(cmdTalker, false, undefined, `TALKER-${this.config.ethmonitorPort}`);
            // open them three in a new Terminal window
            let window = new TerminalWindow(tab1, tab2);
            window.open();
            returned = true;
        }

        // wait for nodes to start
        await sleep(4000);

        // get doer's nodeInfo
        let resp = await axios.post(`http://localhost:${this.config.httpPort}`, {
            "jsonrpc": "2.0",
            "method": "admin_nodeInfo",
            "params": [],
            "id": 1,
        });
        if (resp.status != 200) {
            return false;
        }
        let nodeInfo = resp.data as { result: { enode: string } };
        // call admin.addPeer in talker
        resp = await axios.post(`http://localhost:${talkerHttpPort}`, {
            "jsonrpc": "2.0",
            "method": "admin_addPeer",
            "params": [nodeInfo.result.enode],
            "id": 2,
        });
        if (resp.status != 200) {
            return false;
        }
        // let doer mine one block to make coinbase have non-zero ETH
        resp = await axios.post(`http://localhost:${this.config.httpPort}`, {
            "jsonrpc": "2.0",
            "method": "miner_mineBlocks",
            "params": [1],
            "id": 3,
        });
        if (resp.status != 200) {
            return false;
        }
        await sleep(500);
        // set mining task as TxMonitor task
        resp = await axios.post(`http://localhost:${this.config.httpPort}`, {
            "jsonrpc": "2.0",
            "method": "miner_mineWhenTx",
            "params": [],
            "id": 4,
        });
        if (resp.status != 200) {
            return false;
        }

        return returned;
    }

    /**
     * Start the blockchain cluster, resume previous state if there is any.
     * @param background start in the background
     * @return if start in background, return value will be a promise of PIDs of ethmonitor, doer and talker; otherwise return promise of boolean.
     */
    public async start(background: boolean = false): Promise<boolean | { ethmonitorPID: number, doerPID: number, talkerPID: number }> {
        if (!BlockchainCluster.testAndMakeDir(this.config.dir)) {
            console.error(`mkdir ${this.config.dir} failed`);
            return false;
        }
        let doerDir = path.join(this.config.dir, "doer");
        if (!BlockchainCluster.testAndMakeDir(doerDir)) {
            console.error(`mkdir ${doerDir} failed`);
            return false;
        }
        let talkerDir = path.join(this.config.dir, "talker");
        if (!BlockchainCluster.testAndMakeDir(talkerDir)) {
            console.error(`mkdir ${talkerDir} failed`);
            return false;
        }

        // start ethmonitor cmd
        let cmdEthmonitor = new Command(ETHMONITOR_PATH);
        cmdEthmonitor.append(`--verbosity ${this.config.verbosity ? this.config.verbosity : 3}`)
        cmdEthmonitor.append(`--ethmonitor.port ${this.config.ethmonitorPort}`);
        cmdEthmonitor.append(`--ethmonitor.controller ${this.config.controller}`);
        if (this.config.analyzerAddress) {
            cmdEthmonitor.append(`--analyzer.address ${this.config.analyzerAddress}`);
        }
        cmdEthmonitor.append(`--verbosity ${this.config.verbosity ? this.config.verbosity : 3}`);

        // start Doer cmd
        let cmdDoer = new Command(GETH_PATH);
        cmdDoer.append(`--verbosity ${this.config.verbosity ? this.config.verbosity : 3}`)
        cmdDoer.append(`--datadir ${doerDir}`);
        cmdDoer.append(`--keystore ${this.config.keyStoreDir}`);
        if (this.config.networkId) {
            cmdDoer.append(`--networkid ${this.config.networkId}`);
        }
        cmdDoer.append(`--port ${await getPort({port: getPort.makeRange(30300, 30399)})}`);
        cmdDoer.append(`--nodiscover`);
        cmdDoer.append(`--ipcdisable`);
        if (this.config.httpPort) {
            cmdDoer.append(`--http -http.api web3,eth,txpool,net --http.port ${this.config.httpPort} --http.corsdomain='*'`);
        }
        if (this.config.wsPort) {
            cmdDoer.append(`--ws --wsport ${this.config.wsPort} --wsorigins "*"`);
        }
        if (this.config.graphql) {
            cmdDoer.append(`--graphql`);
        }
        cmdDoer.append(`--syncmode full`);
        cmdDoer.append(`--ethmonitor.address localhost:${this.config.ethmonitorPort}`);
        if (this.config.extra) {
            cmdDoer.append(this.config.extra);
        }
        cmdDoer.append(`console`);

        // start Talker cmd
        let cmdTalker = new Command(GETH_PATH);
        cmdTalker.append(`--verbosity ${this.config.verbosity ? this.config.verbosity : 3}`)
        cmdTalker.append(`--datadir ${talkerDir}`);
        cmdTalker.append(`--keystore ${this.config.keyStoreDir}`);
        if (this.config.networkId) {
            cmdTalker.append(`--networkid ${this.config.networkId}`);
        }
        cmdTalker.append(`--port ${await getPort({port: getPort.makeRange(30300, 30399)})}`);
        cmdTalker.append(`--nodiscover`);
        cmdTalker.append(`--ipcdisable`);
        cmdTalker.append(`--syncmode full`);
        cmdTalker.append(`--ethmonitor.address localhost:${this.config.ethmonitorPort}`);
        cmdTalker.append(`--ethmonitor.talker`);
        cmdTalker.append(`console`);

        if (background) {
            // open in the background
            let ethmonitorProcess = spawn(cmdEthmonitor.command, cmdEthmonitor.args, {
                detached: true,
            });
            ethmonitorProcess.unref();
            let doerProcess = spawn(cmdDoer.command, cmdDoer.args, {
                detached: true,
            });
            doerProcess.unref();
            let talkerProcess = spawn(cmdTalker.command, cmdTalker.args, {
                detached: true,
            });
            talkerProcess.unref();
            this.ethmonitorPID = ethmonitorProcess.pid;
            this.doerPID = doerProcess.pid;
            this.talkerPID = talkerProcess.pid;
            return {
                ethmonitorPID: ethmonitorProcess.pid,
                doerPID: doerProcess.pid,
                talkerPID: talkerProcess.pid,
            }
        } else {
            let tab0 = new Tab(cmdEthmonitor, false, undefined, `Ethmonitor-${this.config.ethmonitorPort}`);
            let tab1 = new Tab(cmdDoer, false, undefined, `DOER-${this.config.ethmonitorPort}`);
            let tab2 = new Tab(cmdTalker, false, undefined, `TALKER-${this.config.ethmonitorPort}`);
            // open them three in a new Terminal window
            let window = new TerminalWindow(tab0, tab1, tab2);
            window.open();
            this.ethmonitorPID = undefined;
            this.doerPID = undefined;
            this.talkerPID = undefined;
            return true;
        }
    }

    /**
     * Stop the cluster processes. This only takes effect when cluster is started/deployed at background.
     */
    public async stop() {
        for (let pid of [this.ethmonitorPID, this.doerPID, this.talkerPID]) {
            if (pid) {
                process.kill(pid, "SIGINT");
            }
        }
        this.ethmonitorPID = undefined;
        this.doerPID = undefined;
        this.talkerPID = undefined;
    }
}

export function startDarcher(darcher: AnalyzerConfig, dbMonitor: DBMonitorConfig, configFile: string) {
    let seg = [`yarn workspace @darcher/analyzer start:darcher`];
    seg.push(path.join(__dirname, 'configs', configFile));
    let cmd = seg.join(" ");
    shell.exec(`ttab -a iTerm2 -t Darcher ${cmd}`);
}

export function startDBMonitor(darcher: AnalyzerConfig, dbMonitor: DBMonitorConfig) {
    if (dbMonitor.db === DBOptions.indexedDB) {
        // start dbmonitor-browser
        let seg = [`yarn workspace @darcher/dbmonitor-browser watch`];
        seg.push(`--env.wsPort ${darcher.wsPort}`);
        seg.push(`--env.dbAddress ${dbMonitor.dbAddress}`)
        seg.push(`--env.dbName ${dbMonitor.dbName}`);
        let cmd = seg.join(" ");
        shell.exec(`ttab -a iTerm2 -t "dbmonitor-browser watcher" ${cmd}`);
    } else if (dbMonitor.db === DBOptions.mongoDB) {

    }
}

/**
 * Get a list of account addresses stored in darcher/keystore
 */
export function getPredefinedAccounts(): string[] {
    return fs.readdirSync(path.join(__dirname, "..", "..", "..", "keystore"))
        .sort()
        .filter(value => value.startsWith("account"))
        .map(name => name.split("-")[1].split(".")[0]);
}

/**
 * Copy the predefined accounts to the given keystore dir
 * @param keystore the keystore to copy accounts to
 */
export function copyPredefinedAccounts(keystore: string) {
    shell.cp(path.join(__dirname, "..", "..", "..", "keystore", "*"), keystore);
}

/**
 * Get the passwords.txt file path of the passwords of predefined accounts.
 */
export function getPredefinedAccountsPasswords(): string {
    return path.join(__dirname, "..", "..", "..", "keystore", "passwords.txt");
}

/**
 * Given the truffle deploy result json file path, return the object containing the contractName, abi, and address.
 * If the given file is not a valid json file or the content is not truffle deployment output, an error will be thrown.
 * @param truffleJsonFilePath
 */
export function getTruffleDeployedContract(truffleJsonFilePath: string): { contractName: string, abi: object, deployment: { [networkId: number]: { address: string } } } {
    let obj = JSON.parse(fs.readFileSync(truffleJsonFilePath, 'utf8'));
    if (obj == null) {
        throw new Error(`${truffleJsonFilePath} is not a valid json file`);
    }
    let ret: { contractName: string, abi: object, deployment: { [networkId: number]: { address: string } } } = {
        contractName: "",
        abi: null,
        deployment: {},
    };
    if (!obj.hasOwnProperty("contractName") || !obj.hasOwnProperty("abi")) {
        throw new Error(`${truffleJsonFilePath} is not a truffle deployment result json file, missing contractName and abi`);
    }
    ret["contractName"] = obj["contractName"];
    ret["abi"] = obj["abi"];
    if (!obj.hasOwnProperty("networks")) {
        return ret;
    }
    let networks = obj["networks"];
    for (let networkId in networks) {
        if (networks.hasOwnProperty(networkId)) {
            let id = parseInt(networkId);
            if (isNaN(id)) {
                continue;
            }
            ret.deployment[id] = {address: networks[networkId].address};
        }
    }
    return ret;
}
