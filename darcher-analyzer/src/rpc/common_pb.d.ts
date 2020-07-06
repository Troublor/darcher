// package: darcher
// file: common.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export enum Role {
    DOER = 0,
    TALKER = 1,
}

export enum Error {
    NILERR = 0,
    INTERNALERR = 1,
    TIMEOUTERR = 2,
}

export enum TxState {
    CREATED = 0,
    PENDING = 1,
    EXECUTED = 2,
    DROPPED = 3,
    CONFIRMED = 4,
}
