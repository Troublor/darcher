import {MockDarcherServer} from "../src/service";
import {getUUID, Logger, ReverseRPCServer, sleep} from "@darcher/helpers";
import {
    ConsoleErrorMsg,
    DAppDriverControlMsg,
    DAppTestDriverServiceClient,
    Role,
    TestEndMsg,
    TestStartMsg, TxMsg,
} from "@darcher/rpc";
import * as grpc from "grpc";
import * as sinon from "sinon";
import {expect} from "chai";
import {Config, DBOptions} from "@darcher/config";

class MockDarcherServerClient {
    readonly dappTestDriverServiceClient: DAppTestDriverServiceClient;
    readonly dappDriverControlReverseRPC: ReverseRPCServer<DAppDriverControlMsg, DAppDriverControlMsg>;
    readonly logger: Logger;
    readonly name: string;

    constructor(logger: Logger, config: Config, name?: string) {
        this.logger = logger;
        this.name = name;
        this.dappTestDriverServiceClient = new DAppTestDriverServiceClient(`localhost:${config.analyzer.grpcPort}`, grpc.credentials.createInsecure());
        const stream = this.dappTestDriverServiceClient.dappDriverControl();
        stream.write(new DAppDriverControlMsg().setRole(Role.DAPP).setId(getUUID()));
        this.dappDriverControlReverseRPC = new ReverseRPCServer<DAppDriverControlMsg, DAppDriverControlMsg>("dappDriverControl", stream);
        this.dappDriverControlReverseRPC.serve(this.reverseRPCHandler.bind(this)).catch(e => {
            console.log(this.name ? this.name : "", "err", e);
        });
    }

    async reverseRPCHandler(msg: DAppDriverControlMsg): Promise<DAppDriverControlMsg> {
        this.logger.info(`${this.name} Receive control msg: ${msg.getControlType()}`);
        return Promise.resolve(msg);
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
    };

    const logger = new Logger("darcherServer_test");
    logger.level = "off";

    it("should mock server work well", async function () {
        const eventSpy = sinon.spy();
        logger.on("info", eventSpy);

        const mock = new MockDarcherServer(logger, config);
        mock.txProcessTime = 100;
        await mock.start();

        const client = new MockDarcherServerClient(logger, config);
        await mock.waitForEstablishment();

        // test dappTestService
        await new Promise<void>(resolve => {
            client.dappTestDriverServiceClient.notifyTestStart(new TestStartMsg(), () => {
                expect(eventSpy.getCalls().join(" ").includes("TestStart")).to.be.true;
                resolve();
            });
        });
        await new Promise<void>(resolve => {
            client.dappTestDriverServiceClient.notifyTestEnd(new TestEndMsg(), () => {
                expect(eventSpy.lastCall.args.join(" ").includes("TestEnd")).to.be.true;
                resolve();
            });
        });
        await new Promise<void>(resolve => {
            client.dappTestDriverServiceClient.notifyConsoleError(new ConsoleErrorMsg(), () => {
                expect(eventSpy.lastCall.args.join(" ").includes("ConsoleError")).to.be.true;
                resolve();
            });
        });
        await new Promise<void>(resolve => {
            const reverseRPCCallSpy = sinon.spy();
            client.dappDriverControlReverseRPC.serve(async req => {
                reverseRPCCallSpy(req);
                return req;
            });
            client.dappTestDriverServiceClient.waitForTxProcess(new TxMsg(), () => {
                expect(eventSpy.lastCall.args.join(" ").includes("waitForTxProcess")).to.be.true;
                expect(reverseRPCCallSpy.called).to.be.true;
                resolve();
            });
        });

        await client.shutdown();
        await mock.shutdown();
    }, 20000);

    it("should dappTestDriverService handle repeat reverse rpc connection", async function () {
        const warnSpy = sinon.spy();
        logger.on("warn", warnSpy);

        const mock = new MockDarcherServer(logger, config);
        mock.txProcessTime = 100;
        await mock.start();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const client0 = new MockDarcherServerClient(logger, config, "previous client");
        await mock.waitForEstablishment();

        // client re-connect (should override previous connection)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const client1 = new MockDarcherServerClient(logger, config, "repeat client");
        await mock.waitForEstablishment();

        await sleep(200);


        expect(warnSpy.called).to.be.true;
        expect(warnSpy.lastCall.args.join(" ").includes("repeat establish")).to.be.true;

        const timer = setTimeout(() => {
            // this timer should be cleared if reverse rpc finished within timeout
            expect(true).to.be.false;
        }, 500);
        await mock.dappTestDriverService.refreshPage().then(() => {
            clearTimeout(timer);
        });

        await client0.shutdown();
        await client1.shutdown();
        await mock.shutdown();
    }, 20000);
});
