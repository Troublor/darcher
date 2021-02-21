/* eslint-disable */

// @ts-ignore
const shelljs = require("shelljs");

shelljs.cd("../..");

// @ts-ignore
const folder_exists = (folder: string) => {
    return shelljs.ls().grep(folder).stdout.indexOf(folder) != -1
};

if (!folder_exists("src_raw")) {
    throw new Error("src_raw does not exist");
}

if (folder_exists("src")) {
    if (!folder_exists("src_uninstru") && folder_exists("src_instru")) {
        shelljs.mv("src", "src_uninstru");
        console.log("current src directory is moved to 'src_uninstru'");
    } else if (folder_exists("src_uninstru") && !folder_exists("src_instru")) {
        shelljs.mv("src", "src_instru");
        console.log("current src directory is moved to 'src_instru'");
    } else {
        throw new Error("cannot decide the type of current src, abort");
    }
} else {
    shelljs.mv("src_raw", "src");
    console.log("use 'src_raw' as 'src'");
}
