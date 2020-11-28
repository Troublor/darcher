import {spawnChrome} from "chrome-debugging-client";

(async ()=>{
    const chrome = spawnChrome({
        userDataDir: "/Users/troublor/workspace/darcher_mics/browsers/Chrome/UserData",
    });
    const browser = chrome.connection;
    console.log(browser.targetInfo)
    const r = await browser.send("IndexedDB.requestDatabaseNames", {securityOrigin: "http://localhost"});
    console.log(r);

})()
