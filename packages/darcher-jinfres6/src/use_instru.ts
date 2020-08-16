/* eslint-disable */

// @ts-ignore
const shelljs = require("shelljs");

shelljs.cd("../..");

// @ts-ignore
const folder_exists = (folder: string) => {
    return shelljs.ls().grep(folder).stdout.indexOf(folder) != -1
};

if (!folder_exists("src_instru")) {
    throw new Error("src_instru does not exist");
}

if (folder_exists("src")) {
    if (!folder_exists("src_uninstru") && folder_exists("src_raw")) {
        shelljs.mv("src", "src_uninstru");
        console.log("current src directory is moved to 'src_uninstru'");
    } else if (folder_exists("src_uninstru") && !folder_exists("src_raw")) {
        shelljs.mv("src", "src_raw");
        console.log("current src directory is moved to 'src_raw'");
    } else {
        throw new Error("cannot decide the type of current src, abort");
    }
} else {
    shelljs.mv("src_instru", "src");
    console.log("use 'src_instru' as 'src'");
}
