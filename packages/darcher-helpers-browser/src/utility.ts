export function prettifyHash(hash: string): string {
    let startIndex = 0;
    if (hash.startsWith("0x")) {
        startIndex = 2;
    }
    return `${hash.substring(startIndex, startIndex + 6)}…${hash.substring(hash.length - 6, hash.length)}`;
}
