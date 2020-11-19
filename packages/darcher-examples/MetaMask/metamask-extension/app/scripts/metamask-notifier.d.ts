export interface Data {
    type: string;
}
export interface UnlockRequest extends Data {
    type: 'UnlockRequest';
}
export interface PermissionRequest extends Data {
    type: 'PermissionRequest';
}
export interface UnconfirmedMessage extends Data {
    type: 'UnconfirmedMessage';
}
export interface UnapprovedTx extends Data {
    type: "UnapprovedTx";
    from: string;
    to: string;
    gas: string;
    gasPrice: string;
    value: string;
    hash?: string;
}
export default class MetaMaskNotifier {
    private readonly address;
    private ws;
    private logger;
    constructor(address: string);
    start(): void;
    onMessage(payload: string): void;
    onError(err: any): void;
    onClose(): void;
    private notify;
    notifyUnapprovedTx(data: UnapprovedTx): void;
    notifyUnlockRequest(data: UnlockRequest): void;
    notifyPermissionRequest(data: PermissionRequest): void;
    notifyUnconfirmedMessage(data: UnconfirmedMessage): void;
}
