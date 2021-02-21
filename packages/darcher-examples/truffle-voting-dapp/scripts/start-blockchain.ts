import {Config} from "@darcher/config";
import {BlockchainCluster} from "@darcher/helpers";

export async function startCluster(config: Config, deployMode: boolean= false): Promise<BlockchainCluster> {
    const cluster = new BlockchainCluster(config.clusters[0]);
    if (deployMode) {
        await cluster.reset();
        await cluster.deploy(false);
    }else {
        await cluster.start(true)
    }
    return cluster;
}
