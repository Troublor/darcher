import * as grpc from "grpc";

export enum DarcherErrorCode {
    ServiceNotAvailable,
    ServiceCancelled,
    GRPCRawError,
    Timout,
    DBAdapterNotLoaded,
}

export class DarcherError extends Error {
    constructor(code: DarcherErrorCode, message: string) {
        super(message);
    }
}

export class ServiceNotAvailableError extends DarcherError {
    public readonly serviceName: string;

    constructor(serviceName: string = '') {
        super(DarcherErrorCode.ServiceNotAvailable, `${serviceName} service not available`);
        this.serviceName = serviceName;
    }
}

export class ServiceCancelledError extends DarcherError {
    public readonly serviceName: string;

    constructor(serviceName: string = '') {
        super(DarcherErrorCode.ServiceCancelled, `${serviceName} service has been canceled`);
        this.serviceName = serviceName;
    }
}

export class GRPCRawError extends DarcherError {
    public readonly grpcError: grpc.ServiceError;
    public readonly serviceName: string;

    constructor(serviceName: string = '', grpcErr: grpc.ServiceError) {
        super(DarcherErrorCode.GRPCRawError, `${serviceName} grpc error: ${grpcErr.message}`);
        this.grpcError = grpcErr;
        this.serviceName = serviceName;
    }
}

export class TimeoutError extends DarcherError {
    constructor() {
        super(DarcherErrorCode.Timout, `timeout`);
    }
}

export class DBAdapterNotLoaded extends DarcherError {
    constructor() {
        super(DarcherErrorCode.DBAdapterNotLoaded, `dbmonitor adapter not loaded`);
    }
}