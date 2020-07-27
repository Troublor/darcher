async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

sleep(1000).then(async () => {
    await sleep(1000);
})