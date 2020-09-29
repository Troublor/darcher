import * as WebSocket from "ws";
import http from "http";
import {
    DarcherErrorCode,
    getUUID,
    Logger,
    PromiseKit,
    ReverseRPCClient,
    Service,
    ServiceNotAvailableError,
    TimeoutError,
    WebsocketError
} from "@darcher/helpers";
import {
    ControlMsg,
    DBContent,
    Error as rpcError,
    GetAllDataControlMsg,
    IDBMonitorServiceServer,
    RequestType,
    Role
} from "@darcher/rpc"
import {ServerDuplexStream} from "grpc";
import {EventEmitter} from "events";

export class DbMonitorService implements Service {
    private readonly logger: Logger;
    private readonly wsPort: number; // grpc port is not needed because grpc is opened upstream

    public readonly wsTransport: DBMonitorServiceViaWebsocket;
    public readonly grpcTransport: DBMonitorServiceViaGRPC;

    constructor(logger: Logger, wsPort: number) {
        this.logger = logger;
        this.wsPort = wsPort;
        this.wsTransport = new DBMonitorServiceViaWebsocket(logger, wsPort);
        this.grpcTransport = new DBMonitorServiceViaGRPC(logger);
    }

    public async start(): Promise<void> {
        await this.wsTransport.start();
    }

    public async shutdown(): Promise<void> {
        await this.wsTransport.shutdown();
        await this.grpcTransport.shutdown();
    }

    public async waitForEstablishment(): Promise<void> {
        return new Promise(resolve => {
            // resolve when either of the two transport is established
            this.grpcTransport.waitForEstablishment().then(resolve);
            this.wsTransport.waitForEstablishment().then(resolve);
        });
    }

    public async getAllData(dbAddress: string, dbName: string): Promise<DBContent> {
        try {
            return await this.wsTransport.getAllData(dbAddress, dbName);
        } catch (e) {
            if (e.code === DarcherErrorCode.ServiceNotAvailable) {
                // ws transport is not available, try grpc transport, throw any error this time
                let request = new GetAllDataControlMsg();
                request.setRole(Role.DBMONITOR).setId(getUUID()).setDbAddress(dbAddress).setDbName(dbName);
                let resp = await this.grpcTransport.getAllData(request);
                return resp.getContent();
            } else {
                throw e;
            }
        }
    }

    public async refreshPage(dbAddress: string): Promise<void> {
        return await this.wsTransport.refreshPage(dbAddress);
    }
}

/**
 * DB monitor service, to get database data from dapp
 * Since grpc does not support bidirectional stream in browser, we use websocket as transport to simulate bidirectional stream
 */
class DBMonitorServiceViaWebsocket implements Service {
    private readonly logger: Logger;
    private readonly port: number;
    private wss: WebSocket.Server;

    // connection with dbmonitor
    private conn: WebSocket;
    // reverse rpc pending calls
    private readonly pendingCalls: { [id: string]: PromiseKit<any> }; // map from call id to promise resolve/reject functions

    private emitter: EventEmitter;

    constructor(logger: Logger, port: number) {
        this.logger = logger;
        this.port = port;
        this.pendingCalls = {};
        this.emitter = new EventEmitter();
    }

    public async start(): Promise<void> {
        this.wss = new WebSocket.Server({port: this.port});
        this.wss.on("connection", this.onConnection);
        this.wss.on("error", this.onError);
    }

    public async shutdown(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.wss.close(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    }

    waitForEstablishment(): Promise<void> {
        return new Promise<void>(resolve => {
            this.emitter.once("establish", resolve);
            if (this.conn) {
                this.emitter.removeListener("establish", resolve);
                resolve();
            }
        })
    }

    /* websocket handlers start */
    private onConnection = (ws: WebSocket, request: http.IncomingMessage) => {
        if (this.conn) {
            this.logger.warn("Websocket connection with dbmonitor already established, ignore new connection");
            return
        }
        this.logger.info("Websocket connection with dbmonitor opened");
        this.conn = ws;
        this.emitter.emit("establish");
        ws.on("message", this.onMessage);
        ws.on("close", () => {
            this.logger.info("Websocket connection with dbmonitor closed")
            this.conn = undefined;
        });
    }

    /**
     * message handler of reverse RPC reply
     * @param message reply from dbmonitor
     */
    private onMessage = (message: any) => {
        let resp = ControlMsg.deserializeBinary(message);
        if (!resp.getId()) {
            return
        }
        let {resolve: resolveFunc, reject: rejectFunc} = this.pendingCalls[resp.getId()];
        let data = null;
        switch (resp.getType()) {
            case RequestType.GET_ALL_DATA:
                if (resp.getErr() !== rpcError.NILERR) {
                    switch (resp.getErr()) {
                        case rpcError.SERVICENOTAVAILABLEERR:
                            rejectFunc ? rejectFunc(new ServiceNotAvailableError("dbMonitor")) : "dbMonitor service not available";
                            break;
                        case rpcError.TIMEOUTERR:
                            rejectFunc ? rejectFunc(new TimeoutError()) : "dbMonitor service timeout";
                            break;
                        case rpcError.INTERNALERR:
                            rejectFunc ? rejectFunc(new Error("dbMonitor internal error")) : "dbMonitor service timeout";
                            break;
                    }
                } else {
                    data = DBContent.deserializeBinary(resp.getData() as Uint8Array);
                    resolveFunc ? resolveFunc(data) : undefined;
                }
                break;
            case RequestType.REFRESH_PAGE:
                if (resp.getErr() !== rpcError.NILERR) {
                    rejectFunc ? rejectFunc(resp.getErr()) : undefined;
                } else {
                    resolveFunc ? resolveFunc() : undefined;
                }
                break;
        }
    }

    private onError = (error: Error) => {
        this.logger.error(new WebsocketError(error));
    }

    /* websocket handlers end */

    /**
     * get all db data from dapp
     * @constructor
     */
    public async getAllData(address: string, dbName: string): Promise<DBContent> {
        let id = getUUID();
        if (!this.conn) {
            throw new ServiceNotAvailableError("getAllData");
        }
        let req = new ControlMsg();
        req.setId(id);
        req.setType(RequestType.GET_ALL_DATA);
        req.setDbAddress(address);
        req.setDbName(dbName);
        this.conn.send(req.serializeBinary());
        return new Promise<DBContent>((resolve, reject) => {
            this.pendingCalls[id] = {resolve, reject};
        });
    }

    public async refreshPage(address: string): Promise<void> {
        let id = getUUID();
        if (!this.conn) {
            throw new ServiceNotAvailableError("refreshPage");
        }
        let req = new ControlMsg();
        req.setId(id);
        req.setType(RequestType.REFRESH_PAGE);
        req.setDbAddress(address);
        this.conn.send(req.serializeBinary());
        return new Promise((resolve, reject) => {
            this.pendingCalls[id] = {resolve, reject};
        });
    }
}

class DBMonitorServiceViaGRPC implements IDBMonitorServiceServer, Service {
    private readonly logger: Logger;

    private readonly getAllDataControlReverseRPC: ReverseRPCClient<GetAllDataControlMsg, GetAllDataControlMsg>;

    constructor(logger: Logger) {
        this.logger = logger;
        this.getAllDataControlReverseRPC = new ReverseRPCClient<GetAllDataControlMsg, GetAllDataControlMsg>("getAllData");
    }

    start(): Promise<void> {
        return Promise.resolve();
    }

    public async waitForEstablishment(): Promise<void> {
        await this.getAllDataControlReverseRPC.waitForEstablishment();
    }

    public async shutdown(): Promise<void> {
        await this.getAllDataControlReverseRPC.close();
    }

    /**
     * Establish getAllDataControl reverse rpc
     * @param call
     */
    getAllDataControl(call: ServerDuplexStream<GetAllDataControlMsg, GetAllDataControlMsg>): void {
        if (this.getAllDataControlReverseRPC.established) {
            this.logger.warn("getAllDataControlReverseRPC already established, ignore new request");
            return
        }
        // serve the initial call
        this.logger.info("getAllDataControl reverse RPC connected");
        this.getAllDataControlReverseRPC.establish(call);
    }

    /**
     * Public function to getAllData
     * @param request
     */
    public getAllData(request: GetAllDataControlMsg): Promise<GetAllDataControlMsg> {
        return this.getAllDataControlReverseRPC.call(request);
    }

}
