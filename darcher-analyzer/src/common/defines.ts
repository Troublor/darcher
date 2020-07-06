export const darcherServerPort = 1236;

export interface Reply {
    Err: string
}

export interface Msg {

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

export enum CRUDOperation {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
}

export enum LifecycleState {
    CREATED = "created",
    PENDING = "pending",
    EXECUTED = "executed",
    REVERTED = "reverted",
    REEXECUTED = "re-executed",
    CONFIRMED = "confirmed",
}

export interface DAppState {
    // TODO need implementation
}