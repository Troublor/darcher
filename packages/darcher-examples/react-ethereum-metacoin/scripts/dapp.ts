import * as child_process from "child_process";
import * as path from "path";

export async function start(): Promise<child_process.ChildProcess> {
    return new Promise<child_process.ChildProcess>(resolve => {
        const child = child_process.spawn(
            "yarn",
            ["web"], {
                cwd: path.join(__dirname, "..", "react-ethereum-metacoin"),
                stdio: "pipe",
            }
        );
        child.stdout.setEncoding("utf-8");
        child.stdout.on("data", data => {
            data = data.trim();
            data && console.log(data);
            if (data.includes("localhost:3000")) {
                resolve();
            }
        })
    });
}

if (require.main === module) {
    (async () => {
        await start();
        console.log("started")
    })()
}
