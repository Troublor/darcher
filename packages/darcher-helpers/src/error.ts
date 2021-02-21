import * as grpc from "grpc";

export enum DarcherErrorCode {
    // error wrapper types
    WebSocketError,
    GRPCRawError,
    BadConfiguration,

    // customized types
    ServiceNotAvailable,
    ServiceCancelled,
    Timout,
    DBAdapterNotLoaded,

    // miscellaneous
    Raw,
}

export class DarcherError extends Error {
    public readonly code: DarcherErrorCode;

    constructor(code: DarcherErrorCode, message: string) {
        super(message);
        this.code = code;
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

export class DBAdapterNotLoadedError extends DarcherError {
    constructor() {
        super(DarcherErrorCode.DBAdapterNotLoaded, `dbmonitor adapter not loaded`);
    }
}

export class BadConfigurationError extends DarcherError {
    public readonly rawError: Error

    constructor(e: Error, message?: string) {
        super(DarcherErrorCode.BadConfiguration, message);
        this.rawError = e;
    }
}

export class WebsocketError extends DarcherError {
    public readonly wsError: Error;

    constructor(e: Error) {
        super(DarcherErrorCode.WebSocketError, e.message)
        this.wsError = e;
    }
}