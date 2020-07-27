let id = 0;

export function getUUID(): string {
    let ret = id.toString();
    id++;
    return ret;
}