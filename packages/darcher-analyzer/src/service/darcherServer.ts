import {Server, ServerCredentials} from "grpc";
import {
    DarcherControllerServiceService,
    IDarcherControllerServiceServer
} from "../rpc/darcher_controller_service_grpc_pb";
import {DarcherControllerService} from "./darcherControllerService";
import {logger} from "../common";
import {DBMonitorService} from "./dbmonitorService";


export class DarcherServer extends Server {
    private readonly grpcPort: number;
    private readonly websocketPort: number;

    private readonly _darcherControllerService: DarcherControllerService;
    private readonly _dbMonitorService: DBMonitorService;

    constructor(grpcPort: number, websocketPort: number) {
        super();
        this.grpcPort = grpcPort;
        this.websocketPort = websocketPort;
        this._darcherControllerService = new DarcherControllerService();
        this._dbMonitorService = new DBMonitorService(websocketPort);
    }

    public start() {
        // start websocket services
        this._dbMonitorService.start()

        // start grpc services
        this.addService <IDarcherControllerServiceServer>(DarcherControllerServiceService, this._darcherControllerService);
        let addr = `localhost:${this.grpcPort}`;
        this.bind(addr, ServerCredentials.createInsecure());
        logger.info(`Darcher server started at ${addr}`);
        super.start();
    }


    get darcherControllerService(): DarcherControllerService {
        return this._darcherControllerService;
    }

    get dbMonitorService(): DBMonitorService {
        return this._dbMonitorService;
    }
}