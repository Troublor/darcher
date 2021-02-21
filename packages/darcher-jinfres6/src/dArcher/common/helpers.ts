const request = require("request");

export function RPC(url: string, method: string, param: any, handler: (error: any, reply: any) => void) {
    if (!Array.isArray(param)) {
        console.log("RPC param is not an array: ", param);
        return;
    }
    let options = {
        url: url,
        method: "post",
        headers:
            {
                "content-type": "application/json"
            },
        body: JSON.stringify({
            "jsonrpc": "1.0",
            "id": 1,
            "method": method,
            "params": param,
        })
    };

    request(options, function (error: any, response: any, body: any) {
        handler(error, body);
    });
}