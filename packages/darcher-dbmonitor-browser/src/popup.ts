import * as $ from 'jquery';
import {ExtensionMsgType, SettingMsg, SettingMsgOperation} from "./types";

let count = 0;

$(function () {
    // get current domain
    let msg: SettingMsg = {
        type: ExtensionMsgType.SETTING,
        operation: SettingMsgOperation.FETCH,
        domain: "",
        dbNames: [],
    }
    chrome.runtime.sendMessage(msg, (response: SettingMsg) => {
        $("#domain").val(response.domain);
        $("#dbNames").val(response.dbNames.join(";"));
    })
    const updateFunc = () => {
        let dbNames = []
        for (let dbName of (<string>$("#dbNames").val()).split(";")) {
            if (dbName.length > 0) {
                dbNames.push(dbName.trim());
            }
        }
        let msg: SettingMsg = {
            type: ExtensionMsgType.SETTING,
            operation: SettingMsgOperation.UPDATE,
            domain: <string>$("#domain").val(),
            dbNames: dbNames,
        }
        chrome.runtime.sendMessage(msg);
    };
    // save target domain
    $("#domain").on('input', updateFunc);
    $("#dbNames").on('input', updateFunc);
});
