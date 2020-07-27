import {Reply} from "./index";

export const genEmptyReply = (): Reply => {
    return <Reply>{Err: null};
}

export const isNullOrUndefined = (obj: any): boolean => {
    return obj === null || obj === undefined;
}

export const isDeepEqual = (obj1: object, obj2: object): boolean => {
    if (obj1 === obj2) {
        return true;
    }
    if (isNullOrUndefined(obj1) || isNullOrUndefined(obj2)) {
        return false;
    }
    if (typeof obj1 !== "object" || typeof obj2 !== "object") {
        return false;
    }
    for (let key of Object.keys(obj1)) {
        // skip some keys based on heuristic
        let keywords = ["transactionHash", "txHash", "blockNumber", "blockHash", "transactionIndex", "logIndex", "timestamp", "createdAt", "updatedAt", "id"]
        if (keywords.map(s => s.toLowerCase()).some(s => key.toLowerCase().includes(s))) {
            continue;
        }

        if (!Object.keys(obj2).includes(key)) {
            return false;
        }
        if (typeof obj1 === "object") {
            // @ts-ignore
            if (!isDeepEqual(obj1[key], obj2[key])) {
                return false;
            }
        } else {
            // @ts-ignore
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
    }
    return true;
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