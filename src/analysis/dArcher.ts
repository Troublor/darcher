import {TxAnalysis} from "./analysis";
import {EthMonitorController, EventNames, Server} from "../downstream";
import {DAppStateChangeMsg, isNullOrUndefined, LifecycleState, logger, sleep} from "../common";
import * as readline from "readline";
import {EventEmitter} from "events";

export class DArcher {

    private server: Server;

    private txAnalysisPool: { [txHash: string]: TxAnalysis };

    private currentTxHash: string;

    private currentTxState: LifecycleState

    /**
     * the time limit for each transaction state to finish database operation
     */
    private static timeLimit = 500;

    /**
     * schedule concurrent transactions, to make them executed one by one
     */
    private scheduler: TxTraverseScheduler;

    constructor() {
        this.txAnalysisPool = {};
        this.scheduler = new TxTraverseScheduler();
        this.server = new Server(this.getController());
        this.server.on(EventNames.DAppStateChange, (msg: DAppStateChangeMsg) => {
            // logger.debug("dapp state changed: ", JSON.stringify(msg, null, 2));
            this.txAnalysisPool[this.currentTxHash].add(this.currentTxState, msg);
        })
    }

    private getController(): EthMonitorController {
        return {
            onTxReceived: async msg => {
                logger.debug("receive tx", msg.Hash)
            },
            onTxStart: async msg => {
                // wait until previous traverse finishes
                await this.scheduler.waitForTurn(msg.Hash);
                // new tx
                this.currentTxHash = msg.Hash
                this.txAnalysisPool[msg.Hash] = new TxAnalysis(msg.Hash);
                this.currentTxState = LifecycleState.PENDING;
                logger.debug(msg.Hash, "tx start");
            },
            onTxFinished: async msg => {
                await sleep(DArcher.timeLimit);
                logger.debug(msg.Hash, "tx finished");
                // await new Promise<void>(resolve => {
                //     let rl = readline.createInterface({
                //         input: process.stdin,
                //         output: process.stdout
                //     });
                //
                //     rl.question(`${msg.Hash} finished,continue?`, (answer) => {
                //         resolve();
                //         rl.close();
                //     });
                // });
                this.txAnalysisPool[this.currentTxHash].export(`analysis_data/${this.currentTxHash}.json`);
                this.currentTxHash = null;
                this.currentTxState = null;
                this.scheduler.finishTraverse(msg.Hash);
            },
            onPivotReached: async msg => {
                // provide a 500 ms window and consider any dapp state change in this window as the change corresponding to the tx state
                await sleep(DArcher.timeLimit);
                // go to next state
                logger.debug("pivot reached, from", msg.CurrentState, "to", msg.NextState);
                // wait for command line input to continue
                await new Promise<void>(resolve => {
                    let rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    rl.question(`${msg.CurrentState}->${msg.NextState},continue?`, (answer) => {
                        resolve();
                        rl.close();
                    });
                });
                this.currentTxState = msg.NextState;
            },
            onTxStateChange: msg => {
                logger.debug(msg.Hash, "state change from", msg.CurrentState, "to", msg.NextState);
            }
        }
    }

    public start(port: number) {
        this.server.start(port);
    }
}

export class TxTraverseScheduler {
    /**
     * transaction queue (txHash) of txs waiting for being traversed
     */
    private readonly queue: string[];

    private idle: boolean;

    private notifier: EventEmitter;

    private dAppStateChangeCache: DAppStateChangeMsg[];

    constructor() {
        this.queue = [];
        this.idle = true;
        this.notifier = new EventEmitter();
        this.dAppStateChangeCache = [];
    }

    /**
     * Wait until its the turn for txHash to traverse
     * @param txHash
     */
    public waitForTurn(txHash: string): Promise<void> {
        if (this.idle) {
            this.idle = false;
            return Promise.resolve();
        }

        this.queue.push(txHash);
        return new Promise<void>(resolve => {
            const listener = (nextHash: string) => {
                if (txHash === nextHash) {
                    // if next tx is me (the first element in queue is my txHash), then resolve the promise
                    this.queue.shift();
                    this.notifier.removeListener("next", listener);
                    this.idle = false;
                    resolve();
                }
            }
            this.notifier.on(txHash, listener);
        })
    }

    /**
     * this method must be called when a tx finishes traverse, to notify next tx in the queue to start traverse
     * @param txHash
     */
    public finishTraverse(txHash: string): void {
        this.idle = true;
        if (this.queue.length > 0) {
            this.notifier.emit(this.queue[0], this.queue[0]);
        }
    }

    public cacheDAppStateChange(msg: DAppStateChangeMsg) {
        this.dAppStateChangeCache.push(msg);
    }
}