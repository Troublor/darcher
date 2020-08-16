import {JSONRPCCallbackType, TcpClientOptions} from "jayson";
import {CRUDOperation, dArcherPort, LifecycleState} from "../common";
import {DAppStateChangeMsg} from "../common";

const jaysonBrowserClient = require("jayson/lib/client/browser")
const axios = require("axios");


class DArcherNotifier {
    private jaysonClient: any;

    constructor() {
        let callServer = function (request: any, callback: any) {
            const options = {
                headers: {
                    "Content-Type": "application/json",
                }
            };

            axios.post(`http://127.0.0.1:${dArcherPort}`, request, options)
                .then(function (response: any) {
                    callback(null, JSON.stringify(response.data));
                })
                .catch(function (err: any) {
                    callback(err);
                });
        }
        this.jaysonClient = new jaysonBrowserClient(callServer);
    }

    notifyDAppStateChange(msg: DAppStateChangeMsg, callback?: JSONRPCCallbackType) {
        this.jaysonClient.request("notifyDAppStateChangeRPC", msg, callback);
    }
}

export const dArcherNotifier = new DArcherNotifier();