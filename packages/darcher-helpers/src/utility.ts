import {Config} from "@darcher/config";
import * as path from "path";
import * as fs from "fs";

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

export async function loadConfig(configPath: string): Promise<Config> {
    async function loadScript(path: string): Promise<Config> {
        let module = await import(path);
        return module.default as Config;
    }

    async function loadJson(path: string): Promise<Config> {
        let content = fs.readFileSync(path);
        return JSON.parse(content.toString()) as Config
    }

    let ext = path.extname(configPath);
    switch (ext) {
        case ".ts":
        case ".tsx":
        case ".js":
        case ".jsx":
            return loadScript(configPath);
        default:
            return loadJson(configPath);
    }

}