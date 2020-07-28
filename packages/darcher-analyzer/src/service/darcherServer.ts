import {Server, ServerCredentials} from "grpc";
import {
    DBMonitorServiceService, EthmonitorControllerServiceService,
    IDBMonitorServiceServer, IEthmonitorControllerServiceServer
} from "@darcher/rpc";
import {EthmonitorControllerService} from "./ethmonitorControllerService";
import {DbMonitorService} from "./dbmonitorService";
import {Logger} from "@darcher/helpers";

/**
 * Darcher server maintain grpc or websocket connection with different components of darcher project.
 */
export class DarcherServer extends Server {
    private readonly logger: Logger;
    private readonly grpcPort: number;
    private readonly websocketPort: number;

    private readonly _ethmonitorControllerService: EthmonitorControllerService;
    private readonly _dbMonitorService: DbMonitorService;

    constructor(logger: Logger, grpcPort: number, websocketPort: number) {
        super();
        this.logger = logger;
        this.grpcPort = grpcPort;
        this.websocketPort = websocketPort;
        this._ethmonitorControllerService = new EthmonitorControllerService(this.logger);
        this._dbMonitorService = new DbMonitorService(this.logger, websocketPort);
    }

    /**
     * Start the DarcherServer and returns a promise which resolves when the server is started and rejects when error
     */
    public async start(): Promise<void> {
        // start websocket services
        await this._dbMonitorService.start()
        this.logger.info(`Darcher websocket started at ${this.websocketPort}`);

        // start grpc services
        this.addService<IEthmonitorControllerServiceServer>(EthmonitorControllerServiceService, this._ethmonitorControllerService);
        this.addService<IDBMonitorServiceServer>(DBMonitorServiceService, this._dbMonitorService.grpcTransport);
        let addr = `localhost:${this.grpcPort}`;
        this.bind(addr, ServerCredentials.createInsecure());
        this.logger.info(`Darcher grpc server started at ${addr}`);
        super.start();
    }

    public async waitForRRPCEstablishment(): Promise<void> {
        return new Promise(resolve => {
            // resolve if one of the dbmonitor service is
            this.dbMonitorService.waitForEstablishment().then(resolve);
        })
    }

    public async shutdown(): Promise<void> {
        return new Promise(async resolve => {
            await this.dbMonitorService.shutdown();
            this.tryShutdown(resolve)
        });
    }

    get ethmonitorControllerService(): EthmonitorControllerService {
        return this._ethmonitorControllerService;
    }

    get dbMonitorService(): DbMonitorService {
        return this._dbMonitorService;
    }
}