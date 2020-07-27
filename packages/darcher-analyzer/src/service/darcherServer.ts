import {Server, ServerCredentials} from "grpc";
import {
    DarcherControllerServiceService,
    IDarcherControllerServiceServer
} from "@darcher/rpc";
import {DarcherControllerService} from "./darcherControllerService";
import {DBMonitorService} from "./dbmonitorService";
import {Logger} from "@darcher/helpers";


export class DarcherServer extends Server {
    private readonly logger: Logger;
    private readonly grpcPort: number;
    private readonly websocketPort: number;

    private readonly _darcherControllerService: DarcherControllerService;
    private readonly _dbMonitorService: DBMonitorService;

    constructor(logger: Logger, grpcPort: number, websocketPort: number) {
        super();
        this.logger = logger;
        this.grpcPort = grpcPort;
        this.websocketPort = websocketPort;
        this._darcherControllerService = new DarcherControllerService(this.logger);
        this._dbMonitorService = new DBMonitorService(this.logger, websocketPort);
    }

    public start() {
        // start websocket services
        this._dbMonitorService.start()
        this.logger.info(`Darcher websocket started at ${this.websocketPort}`);

        // start grpc services
        this.addService <IDarcherControllerServiceServer>(DarcherControllerServiceService, this._darcherControllerService);
        let addr = `localhost:${this.grpcPort}`;
        this.bind(addr, ServerCredentials.createInsecure());
        this.logger.info(`Darcher grpc server started at ${addr}`);
        super.start();
    }


    get darcherControllerService(): DarcherControllerService {
        return this._darcherControllerService;
    }

    get dbMonitorService(): DBMonitorService {
        return this._dbMonitorService;
    }
}