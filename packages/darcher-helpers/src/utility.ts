let id = 0;

export function getUUID(): string {
    let ret = id.toString();
    id++;
    return ret;
}

export type PromiseKit<T> = {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

export const sleep: (ms: number) => Promise<void> = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function prettifyHash(hash: string): string {
    let startIndex = 0;
    if (hash.startsWith("0x")) {
        startIndex = 2;
    }
    return `${hash.substring(startIndex, startIndex + 6)}…${hash.substring(hash.length - 6, hash.length)}`;
}