import * as child_process from "child_process";
import * as path from "path";
import * as Stream from "stream";
import {Logger, Service} from "@darcher/helpers";
import {Darcher} from "@darcher/analyzer";
import {mainAccountAddress} from "./config/sovereign.config";
import {TxMsg} from "@darcher/rpc";

export function reset() {
    const result = child_process.spawnSync(
        "meteor",
        ["reset"], {
            cwd: path.join(__dirname, "..", "sovereign"),
            stdio: "inherit",
        }
    );
    if (result.error) {
        console.log(result);
    }
}

export async function start(logStream: Stream.Writable): Promise<child_process.ChildProcess> {
    return new Promise<child_process.ChildProcess>(resolve => {
        const child = child_process.spawn(
            "meteor",
            ["npm", "run", "start:dev"], {
                cwd: path.join(__dirname, "..", "sovereign"),
                stdio: "pipe",
            }
        );
        child.stdout.setEncoding("utf-8");
        child.stdout.on("data", data => {
            data = data.trim();
            data && logStream.write(data + "\n");
            if (data.includes("Completed Cron Job")) {
                resolve();
            }
        });
        child.stdout.on("end", () => {
            logStream.end();
        });
    });
}

// propose and process proposals
interface Proposal {
    id: number;
}

export class ProposalService implements Service {
    private readyToProcess: Proposal[] = [];
    private count: number = 0;
    private interval: NodeJS.Timeout;

    constructor(
        private readonly darcher: Darcher,
        private readonly logger: Logger,
    ) {
    }

    async shutdown(): Promise<void> {
        clearInterval(this.interval);
    }

    async start(): Promise<void> {
        await this.process();
        await this.propose();
        this.interval = setInterval(async ()=>{
            await this.process();
            await this.propose();
        }, 5 * 60 *1000);
    }

    waitForEstablishment(): Promise<void> {
        return Promise.resolve(undefined);
    }

    private async propose() {
        this.logger.info("Propose proposal " + this.count);
        await new Promise(async resolve => {
            const child = child_process.spawn(
                "npx",
                ["buidler", "--network", "testnet", "moloch-submit-proposal", "--applicant", mainAccountAddress, "--details", `"Proposal ${this.count}"`, "--shares", "1", "--tribute", "0"], {
                    stdio: "inherit",
                    cwd: path.join(__dirname, "..", "DemocracyDAO"),
                },
            );
            child.on("exit", async code => {
                if (code === 0) {
                    if (this.darcher.currentAnalyzer &&
                        this.darcher.currentAnalyzer.log) {
                        this.darcher.currentAnalyzer.log.stack = ["submit proposal"];
                    }
                    await this.darcher.dappTestDriverHandler.waitForTxProcess(new TxMsg());
                    setTimeout(() => {
                        this.readyToProcess.push({
                            id: this.count,
                        });
                    }, 20 * 60 * 1000);
                    this.count++;
                } else {
                    this.logger.warn("submit proposal failed");
                }
                resolve();
            })
        });
    }

    private async process() {
        while (this.readyToProcess.length > 0) {
            const proposal = this.readyToProcess.shift();
            this.logger.info("Process proposal " + proposal.id);
            await new Promise(async resolve => {
                const child = child_process.spawn(
                    "npx",
                    ["buidler", "--network", "testnet", "moloch-process-proposal", "--proposal", proposal.id.toString()], {
                        stdio: "inherit",
                        cwd: path.join(__dirname, "..", "DemocracyDAO"),
                    },
                );
                child.on("exit", async code => {
                    if (code === 0) {
                        if (this.darcher.currentAnalyzer &&
                            this.darcher.currentAnalyzer.log) {
                            this.darcher.currentAnalyzer.log.stack = ["process proposal"];
                        }
                        await this.darcher.dappTestDriverHandler.waitForTxProcess(new TxMsg());
                    } else {
                        this.logger.warn("process proposal failed");
                    }
                    resolve();
                });
            });
        }
    }
}


if (require.main === module) {
    (async () => {
        reset();
        await start(process.stdout);
        console.log("started")
    })()
}
