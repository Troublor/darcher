import config, {Cluster, Darcher, DBMonitor, DBOptions} from "@darcher/config";
import * as shell from "shelljs";
import * as path from "path";
import * as getPort from "get-port";

// this script starts ethmonitor clusters according to the config in @darcher/config

function testAndMakeDir(path: string): boolean {
    if (!shell.test("-d", path)) {
        // dir does not exist
        shell.mkdir(path);
        if (shell.error()) {
            return false;
        }
    }
    return true
}

export function resetCluster(cluster: Cluster): boolean {
    // check if blockchain dir exists
    if (!testAndMakeDir(cluster.dir)) {
        console.error(`mkdir ${cluster.dir} failed`);
        return false;
    }
    let doerDir = path.join(cluster.dir, "doer");
    if (!testAndMakeDir(doerDir)) {
        console.error(`mkdir ${doerDir} failed`);
        return false;
    }
    let talkerDir = path.join(cluster.dir, "talker");
    if (!testAndMakeDir(talkerDir)) {
        console.error(`mkdir ${talkerDir} failed`);
        return false;
    }

    // check if genesis file exists
    if (!shell.test("-f", cluster.genesisFile)) {
        console.error(`genesis file ${cluster.genesisFile} not found`);
        return false;
    }

    // remove previous data
    shell.rm("-rf", path.join(doerDir, "geth"), path.join(doerDir, "history"));
    shell.rm("-rf", path.join(talkerDir, "geth"), path.join(talkerDir, "history"));

    // re-initialize doer
    let seg = [`yarn workspace @darcher/go-ethereum start:geth`];
    seg.push(`--datadir ${doerDir}`);
    seg.push(`init`);
    seg.push(cluster.genesisFile);
    let gethCmd = seg.join(" ");
    shell.exec(gethCmd);

    // re-initialize talker
    seg = [`yarn workspace @darcher/go-ethereum start:geth`];
    seg.push(`--datadir ${talkerDir}`);
    seg.push(`init`);
    seg.push(cluster.genesisFile);
    gethCmd = seg.join(" ");
    shell.exec(gethCmd);
}

export function startCluster(darcher: Darcher, cluster: Cluster) {
    if (!testAndMakeDir(cluster.dir)) {
        console.error(`mkdir ${cluster.dir} failed`);
        return false;
    }
    let doerDir = path.join(cluster.dir, "doer");
    if (!testAndMakeDir(doerDir)) {
        console.error(`mkdir ${doerDir} failed`);
        return false;
    }
    let talkerDir = path.join(cluster.dir, "talker");
    if (!testAndMakeDir(talkerDir)) {
        console.error(`mkdir ${talkerDir} failed`);
        return false;
    }

    // start ethmonitor
    let ethmonitorCmd = `yarn workspace @darcher/go-ethereum start:ethmonitor --port ${cluster.ethmonitorPort} --controller ${cluster.controller} --darcherPort ${darcher.grpcPort} --verbosity 4`;
    shell.exec(`ttab -a iTerm2 -t "Ethmonitor ${cluster.ethmonitorPort} ${cluster.controller}" ${ethmonitorCmd}`);

    setTimeout(async () => {
        // start doer
        let seg = [`yarn workspace @darcher/go-ethereum start:geth`];
        seg.push(`--datadir ${doerDir}`);
        seg.push(`--keystore ${cluster.keyStoreDir}`);
        if (cluster.networkId) {
            seg.push(`--networkid ${cluster.networkId}`);
        }
        seg.push(`--port ${await getPort({port: getPort.makeRange(30300, 30399)})}`);
        seg.push(`--nodiscover`);
        seg.push(`--ipcdisable`);
        if (cluster.httpPort) {
            seg.push(`--http --http.api eth,txpool,net --http.port ${cluster.httpPort} --http.corsdomain="*"`);
        }
        if (cluster.wsPort) {
            seg.push(`--ws --wsport ${cluster.httpPort} --wsorigins "*"`);
        }
        seg.push(`--syncmode full`);
        if (cluster.graphqlPort) {
            seg.push(`--graphql --graphql.port ${cluster.graphqlPort}`);
        }
        seg.push(`--monitorport ${cluster.ethmonitorPort}`);
        if (cluster.extra) {
            seg.push(cluster.extra);
        }
        seg.push(`console`);
        let doerCmd = seg.join(" ");
        shell.exec(`ttab -a iTerm2 -t "DOER ${cluster.ethmonitorPort}" ${doerCmd}`);

        // start doer
        seg = [`yarn workspace @darcher/go-ethereum start:geth`];
        seg.push(`--datadir ${talkerDir}`);
        seg.push(`--keystore ${cluster.keyStoreDir}`);
        if (cluster.networkId) {
            seg.push(`--networkid ${cluster.networkId}`);
        }
        seg.push(`--port ${await getPort({port: getPort.makeRange(30300, 30399)})}`);
        seg.push(`--nodiscover`);
        seg.push(`--ipcdisable`);
        seg.push(`--syncmode full`);
        seg.push(`--monitorport ${cluster.ethmonitorPort}`);
        seg.push(`--talker`);
        seg.push(`console`);
        let talkerCmd = seg.join(" ");
        shell.exec(`ttab -a iTerm2 -t "TALKER ${cluster.ethmonitorPort}" ${talkerCmd}`);
    }, 1000);
}

export function startDarcher(darcher: Darcher, dbMonitor: DBMonitor, configFile: string) {
    let seg = [`yarn workspace @darcher/analyzer start:darcher`];
    seg.push(path.join(__dirname, 'configs', configFile));
    let cmd = seg.join(" ");
    shell.exec(`ttab -a iTerm2 -t Darcher ${cmd}`);
}

export function startDBMonitor(darcher: Darcher, dbMonitor: DBMonitor) {
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