import {Server, ServerCredentials} from "grpc";
import {
    DBMonitorServiceService, EthmonitorControllerServiceService,
    IDBMonitorServiceServer, IEthmonitorControllerServiceServer
} from "@darcher/rpc";
import {EthmonitorControllerService} from "./ethmonitorControllerService";
import {DBMonitorServiceViaGRPC, DBMonitorServiceViaWebsocket} from "./dbmonitorService";
import {Logger} from "@darcher/helpers";

/**
 * Darcher server maintain grpc or websocket connection with different components of darcher project.
 */
export class DarcherServer extends Server {
    private readonly logger: Logger;
    private readonly grpcPort: number;
    private readonly websocketPort: number;

    private readonly _ethmonitorControllerService: EthmonitorControllerService;
    private readonly _dbMonitorServiceViaWebsocket: DBMonitorServiceViaWebsocket;
    private readonly _dbMonitorServiceViaGRPC: DBMonitorServiceViaGRPC;

    constructor(logger: Logger, grpcPort: number, websocketPort: number) {
        super();
        this.logger = logger;
        this.grpcPort = grpcPort;
        this.websocketPort = websocketPort;
        this._ethmonitorControllerService = new EthmonitorControllerService(this.logger);
        this._dbMonitorServiceViaWebsocket = new DBMonitorServiceViaWebsocket(this.logger, websocketPort);
        this._dbMonitorServiceViaGRPC = new DBMonitorServiceViaGRPC(this.logger);
    }

    /**
     * Start the DarcherServer and returns a promise which resolves when the server is started and rejects when error
     */
    public async start(): Promise<void> {
        // start websocket services
        await this._dbMonitorServiceViaWebsocket.start()
        this.logger.info(`Darcher websocket started at ${this.websocketPort}`);

        // start grpc services
        this.addService<IEthmonitorControllerServiceServer>(EthmonitorControllerServiceService, this._ethmonitorControllerService);
        this.addService<IDBMonitorServiceServer>(DBMonitorServiceService, this._dbMonitorServiceViaGRPC);
        let addr = `localhost:${this.grpcPort}`;
        this.bind(addr, ServerCredentials.createInsecure());
        this.logger.info(`Darcher grpc server started at ${addr}`);
        super.start();
    }

    public async waitForRRPCEstablishment(): Promise<void> {
        return this.dbMonitorServiceViaGRPC.waitForRRPCEstablishment();
    }

    public async shutdown(): Promise<void> {
        return new Promise(async resolve => {
            this.forceShutdown();
            await this.dbMonitorServiceViaWebsocket.shutdown();
            resolve();
        });
    }

    get ethmonitorControllerService(): EthmonitorControllerService {
        return this._ethmonitorControllerService;
    }

    get dbMonitorServiceViaWebsocket(): DBMonitorServiceViaWebsocket {
        return this._dbMonitorServiceViaWebsocket;
    }

    get dbMonitorServiceViaGRPC(): DBMonitorServiceViaGRPC {
        return this._dbMonitorServiceViaGRPC;
    }
}