import {
    Config,
    ClusterConfig,
    DarcherConfig,
    DBMonitorConfig,
    DBOptions
} from "@darcher/config";
import * as shell from "shelljs";
import * as path from "path";
import * as getPort from "get-port";
import {Command, Tab, TerminalWindow} from "./terminal";

// this script starts ethmonitor clusters according to the config in @darcher/config

/**
 * Blockchain Cluster consists of a Ethmonitor and two geth nodes (DOER and TALKER).
 * A cluster acts as a whole blockchain network to handle Ethereum transactions with reorganization features.
 */
export class BlockchainCluster {
    private readonly analyzerPort: number;
    private readonly config: ClusterConfig;
    private readonly verbosity: number;

    /**
     * The cluster is constructed with cluster configurations
     * @param config ClusterConfig defined in @darcher/config
     * @param analyzerPort analyzerPort defined in DarcherConfig of @darcher/config
     * @param verbosity
     */
    constructor(config: ClusterConfig, analyzerPort: number, verbosity: number = 3) {
        this.config = config;
        this.analyzerPort = analyzerPort;
        this.verbosity = verbosity;
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
     * Start the blockchain cluster, resume previous state if there is any.
     */
    public async start(): Promise<boolean> {
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

        // start ethmonitor
        let cmdEthmonitor = new Command(`yarn workspace @darcher/go-ethereum start:ethmonitor`);
        cmdEthmonitor.append(`--ethmonitor.port ${this.config.ethmonitorPort}`);
        cmdEthmonitor.append(`--ethmonitor.controller ${this.config.controller}`);
        cmdEthmonitor.append(`--analyzer.port ${this.analyzerPort}`);
        cmdEthmonitor.append(`--verbosity ${this.verbosity}`);
        let tab0 = new Tab(cmdEthmonitor, false, undefined, `Ethmonitor-${this.config.ethmonitorPort}`);

        // start Doer
        let cmdDoer = new Command(`yarn workspace @darcher/go-ethereum start:geth`);
        cmdDoer.append(`--datadir ${doerDir}`);
        cmdDoer.append(`--keystore ${this.config.keyStoreDir}`);
        if (this.config.networkId) {
            cmdDoer.append(`--networkid ${this.config.networkId}`);
        }
        cmdDoer.append(`--port ${await getPort({port: getPort.makeRange(30300, 30399)})}`);
        cmdDoer.append(`--nodiscover`);
        cmdDoer.append(`--ipcdisable`);
        if (this.config.httpPort) {
            cmdDoer.append(`--http -http.api eth,txpool,net --http.port ${this.config.httpPort} --http.corsdomain='*'`);
        }
        if (this.config.wsPort) {
            cmdDoer.append(`--ws --wsport ${this.config.httpPort} --wsorigins "*"`);
        }
        if (this.config.graphqlPort) {
            cmdDoer.append(`--graphql --graphql.port ${this.config.graphqlPort}`);
        }
        cmdDoer.append(`--syncmode full`);
        cmdDoer.append(`--ethmonitor.port ${this.config.ethmonitorPort}`);
        if (this.config.extra) {
            cmdDoer.append(this.config.extra);
        }
        cmdDoer.append(`console`);
        let tab1 = new Tab(cmdDoer, false, undefined, `DOER-${this.config.ethmonitorPort}`);

        // start Talker
        let cmdTalker = new Command(`yarn workspace @darcher/go-ethereum start:geth`);
        cmdTalker.append(`--datadir ${talkerDir}`);
        cmdTalker.append(`--keystore ${this.config.keyStoreDir}`);
        if (this.config.networkId) {
            cmdTalker.append(`--networkid ${this.config.networkId}`);
        }
        cmdTalker.append(`--port ${await getPort({port: getPort.makeRange(30300, 30399)})}`);
        cmdTalker.append(`--nodiscover`);
        cmdTalker.append(`--ipcdisable`);
        cmdTalker.append(`--syncmode full`);
        cmdTalker.append(`--ethmonitor.port ${this.config.ethmonitorPort}`);
        cmdTalker.append(`--ethmonitor.talker`);
        cmdTalker.append(`console`);
        let tab2 = new Tab(cmdTalker, false, undefined, `TALKER-${this.config.ethmonitorPort}`);

        // open them three in a new Terminal window
        let window = new TerminalWindow(tab0, tab1, tab2);
        window.open();

        return true;
    }
}

export function startDarcher(darcher: DarcherConfig, dbMonitor: DBMonitorConfig, configFile: string) {
    let seg = [`yarn workspace @darcher/analyzer start:darcher`];
    seg.push(path.join(__dirname, 'configs', configFile));
    let cmd = seg.join(" ");
    shell.exec(`ttab -a iTerm2 -t Darcher ${cmd}`);
}

export function startDBMonitor(darcher: DarcherConfig, dbMonitor: DBMonitorConfig) {
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