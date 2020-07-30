import {Server, ServerCredentials} from "grpc";
import {
    DAppTestDriverServiceService,
    DBMonitorServiceService,
    EthmonitorControllerServiceService,
    IDAppTestDriverServiceServer,
    IDBMonitorServiceServer,
    IEthmonitorControllerServiceServer
} from "@darcher/rpc";
import {EthmonitorControllerService} from "./ethmonitorControllerService";
import {DbMonitorService} from "./dbmonitorService";
import {Logger, Service} from "@darcher/helpers";
import {DappTestDriverService} from "./dappTestDriverService";

/**
 * Darcher server maintain grpc or websocket connection with different components of darcher project.
 */
export class DarcherServer extends Server implements Service {
    private readonly logger: Logger;
    private readonly grpcPort: number;
    private readonly websocketPort: number;

    private readonly _ethmonitorControllerService: EthmonitorControllerService;
    private readonly _dbMonitorService: DbMonitorService;
    private readonly _dappTestDriverService: DappTestDriverService;

    constructor(logger: Logger, grpcPort: number, websocketPort: number) {
        super();
        this.logger = logger;
        this.grpcPort = grpcPort;
        this.websocketPort = websocketPort;
        this._ethmonitorControllerService = new EthmonitorControllerService(this.logger);
        this._dbMonitorService = new DbMonitorService(this.logger, websocketPort);
        this._dappTestDriverService = new DappTestDriverService(this.logger);
        this.addService<IEthmonitorControllerServiceServer>(EthmonitorControllerServiceService, this._ethmonitorControllerService);
        this.addService<IDBMonitorServiceServer>(DBMonitorServiceService, this._dbMonitorService.grpcTransport);
        this.addService<IDAppTestDriverServiceServer>(DAppTestDriverServiceService, this._dappTestDriverService);
        let addr = `localhost:${this.grpcPort}`;
        this.bind(addr, ServerCredentials.createInsecure());
    }

    /**
     * Start the DarcherServer and returns a promise which resolves when the server is started and rejects when error
     */
    public async start(): Promise<void> {
        // start websocket services
        await this._dbMonitorService.start();
        this.logger.info(`Darcher websocket started at ${this.websocketPort}`);
        await this.dappTestDriverService.start();

        // start grpc services
        this.logger.info(`Darcher grpc server started at localhost:${this.grpcPort}`);
        super.start();
    }

    public async waitForEstablishment(): Promise<void> {
        await this.dbMonitorService.waitForEstablishment();
        await this.ethmonitorControllerService.waitForEstablishment();
        await this.dappTestDriverService.waitForEstablishment();
    }

    public async shutdown(): Promise<void> {
        return new Promise(async resolve => {
            await this.dbMonitorService.shutdown();
            await this.dappTestDriverService.shutdown();
            this.forceShutdown()
            resolve();
        });
    }

    get ethmonitorControllerService(): EthmonitorControllerService {
        return this._ethmonitorControllerService;
    }

    get dbMonitorService(): DbMonitorService {
        return this._dbMonitorService;
    }

    get dappTestDriverService(): DappTestDriverService {
        return this._dappTestDriverService;
    }
}