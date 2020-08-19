import {
    ConsoleErrorMsg,
    DAppDriverControlMsg,
    DAppDriverControlType,
    IDAppTestDriverServiceServer,
    Role, TestEndMsg,
    TestStartMsg,
    TxMsg
} from "@darcher/rpc";
import {getUUID, Logger, ReverseRPCClient, Service} from "@darcher/helpers";
import {sendUnaryData, ServerDuplexStream, ServerUnaryCall} from "grpc";
import {Empty} from "google-protobuf/google/protobuf/empty_pb";

export interface DappTestDriverServiceHandler {
    onTestStart: (msg: TestStartMsg) => Promise<void>;
    onTestEnd: (msg: TestEndMsg) => Promise<void>;
    onConsoleError: (msg: ConsoleErrorMsg) => Promise<void>;
    waitForTxProcess: (msg: TxMsg) => Promise<void>;
}

export class DappTestDriverService implements IDAppTestDriverServiceServer, Service {
    private readonly logger: Logger;
    private _handler: DappTestDriverServiceHandler;

    private dappName: string;
    private dappInstanceId: string;

    private readonly dappDriverControlReverseRPC: ReverseRPCClient<DAppDriverControlMsg, DAppDriverControlMsg>;

    constructor(logger: Logger) {
        this.logger = logger;
        this.dappDriverControlReverseRPC = new ReverseRPCClient<DAppDriverControlMsg, DAppDriverControlMsg>("dappDriver");
    }

    get handler(): DappTestDriverServiceHandler {
        return this._handler;
    }

    set handler(value: DappTestDriverServiceHandler) {
        this._handler = value;
    }

    async shutdown(): Promise<void> {
        await this.dappDriverControlReverseRPC.close();
    }

    async start(): Promise<void> {
        return Promise.resolve();
    }

    async waitForEstablishment(): Promise<void> {
        await this.dappDriverControlReverseRPC.waitForEstablishment();
    }

    /**
     * grpc dappDriverControl, to establish reverse rpc
     * @param call
     */
    dappDriverControl(call: ServerDuplexStream<DAppDriverControlMsg, DAppDriverControlMsg>): void {
        if (this.dappDriverControlReverseRPC.established) {
            this.logger.warn("dappDriverReverseRPC repeat establish, override previous connection");
        }
        // serve the initial call
        call.once("data", (msg: DAppDriverControlMsg)=>{
            this.logger.info("dappDriver reverse RPC connected");
            this.dappName = msg.getDappName();
            this.dappInstanceId = msg.getInstanceId();
            this.dappDriverControlReverseRPC.establish(call);
        })
    }

    notifyConsoleError(call: ServerUnaryCall<ConsoleErrorMsg>, callback: sendUnaryData<Empty>): void {
        if (this.handler === undefined || !this.handler.onConsoleError) {
            callback(null, new Empty());
        }else {
            this.handler.onConsoleError(call.request).then(()=>{
                callback(null, new Empty());
            });
        }
    }

    notifyTestEnd(call: ServerUnaryCall<TestEndMsg>, callback: sendUnaryData<Empty>): void {
        if (this.handler === undefined || !this.handler.onTestEnd) {
            callback(null, new Empty());
        } else {
            this.handler.onTestEnd(call.request).then(() => {
                callback(null, new Empty());
            });
        }
    }

    notifyTestStart(call: ServerUnaryCall<TestStartMsg>, callback: sendUnaryData<Empty>): void {
        if (this.handler === undefined || !this.handler.onTestStart) {
            callback(null, new Empty());
        } else {
            this.handler.onTestStart(call.request).then(() => {
                callback(null, new Empty());
            });
        }
    }

    waitForTxProcess(call: ServerUnaryCall<TxMsg>, callback: sendUnaryData<Empty>): void {
        if (this.handler === undefined || !this.handler.waitForTxProcess) {
            callback(null, new Empty());
        }else {
            this.handler.waitForTxProcess(call.request).then(()=>{
                callback(null, new Empty());
            });
        }
    }

    /**
     * Tell dapp driver to refresh page via dappDriverControl reverse rpc
     */
    public async refreshPage(): Promise<void> {
        let req = new DAppDriverControlMsg();
        req.setRole(Role.DAPP)
            .setId(getUUID())
            .setDappName(this.dappName)
            .setInstanceId(this.dappInstanceId)
            .setControlType(DAppDriverControlType.REFRESH);
        await this.dappDriverControlReverseRPC.call(req);
    }
}