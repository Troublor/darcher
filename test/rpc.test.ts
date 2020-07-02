import "mocha";
import {expect} from "chai"
import Server, {ServerEventNames} from "../src/downstream/server";
import {DAppStateChangeMsg} from "../src/downstream/grpc/dArcher_pb";

describe('grpc server test', () => {
    it('server should work', () => {
        let server = new Server(1234);
        server.on(ServerEventNames.DAppStateChange, (msg: DAppStateChangeMsg) => {
            console.log(msg.toString());
        })
    });
});