import {MockDarcherServer} from "../src/service";
import {getUUID, Logger, ReverseRPCServer} from "@darcher/helpers";
import {
    ConsoleErrorMsg,
    DAppDriverControlMsg,
    DAppTestDriverServiceClient,
    Role,
    TestEndMsg,
    TestStartMsg, TxMsg
} from "@darcher/rpc";
import * as grpc from "grpc";
import * as sinon from "sinon";
import {expect} from "chai";
import {Config, DBOptions} from "@darcher/config";

class MockDarcherServerClient {
    readonly dappTestDriverServiceClient: DAppTestDriverServiceClient;
    readonly dappDriverControlReverseRPC: ReverseRPCServer<DAppDriverControlMsg, DAppDriverControlMsg>;

    constructor(logger: Logger, config: Config) {
        this.dappTestDriverServiceClient = new DAppTestDriverServiceClient(`localhost:${config.analyzer.grpcPort}`, grpc.credentials.createInsecure());
        let stream = this.dappTestDriverServiceClient.dappDriverControl();
        stream.write(new DAppDriverControlMsg().setRole(Role.DAPP).setId(getUUID()));
        this.dappDriverControlReverseRPC = new ReverseRPCServer<DAppDriverControlMsg, DAppDriverControlMsg>("dappDriverControl", stream);
    }

    async shutdown() {
        await this.dappDriverControlReverseRPC.close();
    }
}

describe("darcherServer", () => {
    const config = <Config>{
        analyzer: {
            grpcPort: 1234,
            wsPort: 1235,
        },
        dbMonitor: {},
        clusters: [],
    }

    const logger = new Logger("darcherServer_test");
    // logger.level = "off";

    it('should mock server work well', async function () {
        let eventSpy = sinon.spy();
        logger.on("info", eventSpy);

        let mock = new MockDarcherServer(logger, config);
        mock.txProcessTime = 100;
        await mock.start();

        let client = new MockDarcherServerClient(logger, config);
        await mock.waitForEstablishment();

        // test dappTestService
        await new Promise(resolve => {
            client.dappTestDriverServiceClient.notifyTestStart(new TestStartMsg(), () => {
                expect(eventSpy.getCalls().join(" ").includes("TestStart")).to.be.true;
                resolve();
            });
        });
        await new Promise(resolve => {
            client.dappTestDriverServiceClient.notifyTestEnd(new TestEndMsg(), () => {
                expect(eventSpy.lastCall.args.join(" ").includes("TestEnd")).to.be.true;
                resolve();
            });
        })
        await new Promise(resolve => {
            client.dappTestDriverServiceClient.notifyConsoleError(new ConsoleErrorMsg(), () => {
                expect(eventSpy.lastCall.args.join(" ").includes("ConsoleError")).to.be.true;
                resolve();
            });
        });
        await new Promise(resolve => {
            let reverseRPCCallSpy = sinon.spy();
            client.dappDriverControlReverseRPC.serve(async req => {
                reverseRPCCallSpy(req);
                return req;
            });
            client.dappTestDriverServiceClient.waitForTxProcess(new TxMsg(), () => {
                expect(eventSpy.lastCall.args.join(" ").includes("waitForTxProcess")).to.be.true;
                expect(reverseRPCCallSpy.called).to.be.true;
                resolve();
            });
        })

        await client.shutdown();
        await mock.shutdown();
    });
});