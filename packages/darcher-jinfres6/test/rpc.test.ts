import {CRUDOperation, DAppStateChangeMsg, LifecycleState} from "../src/dArcher/common";
import {dArcherNotifier} from "../src/dArcher/upstream";

describe("grpc client testing", () => {
    it('should successfully rpc call', function () {
        let msg: DAppStateChangeMsg = {
            TxHash: "0x1",
            TxState: LifecycleState.PENDING,
            From: {
                "a": 1,
            },
            To: {
                "a": 2,
            },
            Timestamp: Date.now(),
            Operation: CRUDOperation.UPDATE,
        };
        dArcherNotifier.notifyDAppStateChange(msg, (err: any) => {
            console.log(err);
        });
    });
});