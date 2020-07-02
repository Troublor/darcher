import {DArcher} from "./analysis";
import {dArcherServerPort} from "./common";

let dArcher = new DArcher();
dArcher.start(dArcherServerPort);