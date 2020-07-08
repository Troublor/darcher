import {Darcher} from "./darcher";
import {Config} from "@darcher/config";

if (process.argv.length < 3) {
    console.error("no input config file");
    process.exit(-1);
}

import(process.argv[2]).then((m) => {
    let config = m.default as Config;
    let darcher = new Darcher(config);
    darcher.start();
})
