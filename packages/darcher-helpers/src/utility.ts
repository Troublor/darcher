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