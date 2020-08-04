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
import {Logger, prettifyHash, Service} from "@darcher/helpers";
import {DappTestDriverService, DappTestDriverServiceHandler} from "./dappTestDriverService";
import * as prompts from "prompts";
import {Config} from "@darcher/config";

/**
 * Darcher server maintain grpc or websocket connection with different components of darcher project.
 */
export class DarcherServer extends Server implements Service {
    protected readonly logger: Logger;
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
    private config: Config;

    constructor(logger: Logger, config: Config) {
        // for now we do not use wsPort, so just give a random port
        super(logger, config.analyzer.grpcPort, config.analyzer.wsPort);
        this.config = config;
        // register dappTestDriverService handler
        this.dappTestDriverService.waitForEstablishment().then(this.dappTestDriverServiceTestControl.bind(this));

        // dbmonitor-browser test logic
        this.dbMonitorService.waitForEstablishment().then(this.dbMonitorServiceTestControl.bind(this));
    }

    async waitForEstablishment(): Promise<void> {
        await this.dappTestDriverService.waitForEstablishment();
    }

    private async dappTestDriverServiceTestControl() {
        this.logger.info("DAppTestDriverService is connected.");
        this.dappTestDriverService.handler = <DappTestDriverServiceHandler>{
            onTestStart: msg => {
                this.logger.info(`onTestStart dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()}`);
                return Promise.resolve();
            },
            onTestEnd: msg => {
                this.logger.info(`onTestEnd dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()}`);
                return Promise.resolve();
            },
            onConsoleError: msg => {
                this.logger.info(`onConsoleError dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()} err=${msg.getErrorString()}`);
                return Promise.resolve();
            },
            waitForTxProcess: async msg => {
                this.logger.info(`waitForTxProcess refresh page and wait 10 seconds. dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()} txHash=${prettifyHash(msg.getHash())} from=${prettifyHash(msg.getFrom())} to=${prettifyHash(msg.getTo())}`);
                await this.dappTestDriverService.refreshPage();
                return new Promise<void>(resolve => {
                    setTimeout(() => {
                        this.logger.info(`waitForTxProcess finish dappName=${msg.getDappName()} instanceId=${msg.getInstanceId()} txHash=${prettifyHash(msg.getHash())}`);
                        resolve();
                    }, this.txProcessTime);
                });
            }
        }
    }

    private async dbMonitorServiceTestControl() {
        this.logger.info("DBMonitorService is connected.");
        while (true) {
            let response = await prompts({
                type: "text",
                name: "value",
                message: "Fetch DBContent?",
            });
            if (response.value.includes("exit")) {
                break;
            }
            try {
                let content = await this.dbMonitorService.getAllData(this.config.dbMonitor.dbAddress, this.config.dbMonitor.dbName);
                console.log(JSON.stringify(content.toObject(), null, 2));
            }catch (e) {
                this.logger.error(e);
            }
        }
    }
}