export enum LifecycleState {
    CREATED = "created",
    PENDING = "pending",
    EXECUTED = "executed",
    REVERTED = "executed",
    REEXECUTED = "re-executed",
    CONFIRMED = "confirmed",
}

export interface Reply {
    Err: any,
}

export interface Msg {

}

export interface TestMsg extends Msg {
    Msg: string,
}

export interface TxReceivedMsg extends Msg {
    Hash: string,
}

export interface TxStateChangeMsg extends Msg {
    Hash: string,
    CurrentState: LifecycleState,
    NextState: LifecycleState,
}

export interface TxFinishedMsg extends Msg {
    Hash: string,
}

export interface PivotReachedMsg extends Msg {
    Hash: string,
    CurrentState: LifecycleState,
    NextState: LifecycleState,
}

export interface DAppStateChangeMsg extends Msg {
    TxHash: string
    TxState: LifecycleState
    Table: string
    From: object
    To: object
    Operation: CRUDOperation
    Timestamp: number
}

export interface DAppState {
    // TODO need implementation
}

export enum CRUDOperation {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
}