import {Server, ServerCredentials} from "grpc";
import {
    DarcherControllerServiceService,
    IDarcherControllerServiceServer
} from "../rpc/darcher_controller_service_grpc_pb";
import {DarcherControllerService} from "./darcherControllerService";
import {logger} from "../common";


export class DarcherServer extends Server {
    private readonly port: number;

    private readonly _darcherControllerService: DarcherControllerService;

    constructor(port: number) {
        super();
        this.port = port;
        this._darcherControllerService = new DarcherControllerService();
    }

    public start() {
        this.addService <IDarcherControllerServiceServer>(DarcherControllerServiceService, this._darcherControllerService);
        let addr = `localhost:${this.port}`;
        this.bind(addr, ServerCredentials.createInsecure());
        logger.info(`Darcher server started at ${addr}`);
        super.start();
    }


    get darcherControllerService(): DarcherControllerService {
        return this._darcherControllerService;
    }
}