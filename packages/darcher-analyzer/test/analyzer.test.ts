import {Analyzer, LogicalTxState, toTxState} from "../src";
import {DbMonitorService} from "../src/service/dbmonitorService";
import {Logger} from "@darcher/helpers";
import {Config, DBOptions} from "@darcher/config";
import {expect} from "chai";
import {DBContent, TxState, TxStateChangeMsg, TxStateControlMsg, TxTraverseStartMsg} from "@darcher/rpc";

describe("Analyzer", () => {
    // @ts-ignore
    const mockDBMonitorService = <DbMonitorService>{
        refreshPage: () => {
            return {};
        },
        getAllData: () => {
            return new DBContent();
        },
    }

    const logger = new Logger("Analyzer Test");

    const config: Config = {
        analyzer: null,
        clusters: [],
        dbMonitor: {
            db: DBOptions.extensionStorage,
            dbAddress: "localhost",
            dbName: "storage"
        }
    }

    let analyzer: Analyzer;

    const txHash = "0x123456";

    beforeEach(() => {
        analyzer = new Analyzer(logger, config, txHash, mockDBMonitorService);
        analyzer.dappStateUpdateTimeLimit = 1;
    })

    it('should only resolve waitForTxProcess promise at CONFIRMED state', async function () {
        return new Promise<void>(async resolve => {
            let txState = TxState.CREATED;
            analyzer.waitForTxProcess(null).then(() => {
                expect(txState).to.be.equal(TxState.CONFIRMED);
                resolve();
            });

            await analyzer.onTxTraverseStart(new TxTraverseStartMsg().setHash(txHash))
            while (txState !== TxState.CONFIRMED) {
                const nextState: TxState = await analyzer.askForNextState(new TxStateControlMsg().setCurrentState(txState).setHash(txHash));
                const changeMsg = new TxStateChangeMsg()
                    .setHash(txHash)
                    .setFrom(txState)
                    .setTo(nextState);
                txState = nextState;
                await analyzer.onTxStateChange(changeMsg);
            }
        })
    });
})
