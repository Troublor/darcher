/* eslint-disable */

// @ts-ignore
const shelljs = require("shelljs");

shelljs.cd("../..");
shelljs.exec("npx babel src_raw --out-dir src_uninstru --copy-files");