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
import {DappTestDriverService, DappTestDriverServiceHandler} from "./dappTestDriverService";
import {prettifyHash} from "../common";

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

export class MockDarcherServer extends DarcherServer {
    public txProcessTime: number = 10000;
    constructor(logger: Logger, grpcPort: number) {
        // for now we do not use wsPort, so just give a random port
        super(logger, grpcPort, 9999);
        // register dappTestDriverService handler
        this.dappTestDriverService.handler = <DappTestDriverServiceHandler>{
            onTestStart: msg => {
                logger.info(`onTestStart dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()}`);
                return Promise.resolve();
            },
            onTestEnd: msg => {
                logger.info(`onTestEnd dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()}`);
                return Promise.resolve();
            },
            onConsoleError: msg => {
                logger.info(`onConsoleError dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()} err=${msg.getErrorString()}`);
                return Promise.resolve();
            },
            waitForTxProcess: async msg => {
                logger.info(`waitForTxProcess refresh page and wait 10 seconds. dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()} txHash=${prettifyHash(msg.getHash())} from=${prettifyHash(msg.getFrom())} to=${prettifyHash(msg.getTo())}`);
                await this.dappTestDriverService.refreshPage();
                return new Promise<void>(resolve => {
                    setTimeout(() => {
                        logger.info(`waitForTxProcess finish dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()} txHash=${prettifyHash(msg.getHash())}`);
                        resolve();
                    }, this.txProcessTime);
                });
            }
        }
    }

    async waitForEstablishment(): Promise<void> {
        await this.dappTestDriverService.waitForEstablishment();
    }
}