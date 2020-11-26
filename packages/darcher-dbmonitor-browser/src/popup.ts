import * as $ from "jquery";
import * as JSONEditor from "jsoneditor";
import {Config, HtmlModeConfig, MsgType, TestMsg} from "./types";

class JsonEditor {
    private readonly element;
    private content: object;
    private editor: JSONEditor;

    constructor(selector: string, options: object = {}) {
        this.element = $(selector).get(0);
        this.editor = new JSONEditor(this.element, options);
    }

    public setContent(payload: object) {
        this.content = payload;
        this.editor.set(payload);
    }

    public getContent(): object {
        return this.editor.get();
    }
}

class MessageNotifier {
    private readonly messageElement

    constructor(selector: string) {
        this.messageElement = $(selector);
    }

    public show(payload: any) {
        this.messageElement.html(payload);
    }
}

$(function () {
    const jsonViewer = new JsonEditor("#json-viewer");
    const configEditor = new JsonEditor("#config-editor");
    const notifier = new MessageNotifier("#message");

    // get the previously saved storage config
    chrome.storage.local.get("config", value => {
        configEditor.setContent(value.config);
    })

    // handle the uploaded config file
    $("#config-file").on("change", e => {
        let reader = new FileReader();
        reader.onload = (readEvent) => {
            let obj = JSON.parse(readEvent.target.result as string);
            configEditor.setContent(obj);
        }
        // @ts-ignore
        reader.readAsText(e.target.files[0]);
    });

    // handle button click events
    $("#refresh-btn").on("click", () => {
        // send refresh request to background
        const config: Config = configEditor.getContent() as Config;
        const testMsg: TestMsg = {
            type: MsgType.TEST,
            testType: "refresh",
            address: config.address
        }

        notifier.show("Refreshing...");
        chrome.runtime.sendMessage(testMsg, response => {
            notifier.show("Refreshed.");
        });
    });
    $("#fetch-btn").on("click", () => {
        const config: Config = configEditor.getContent() as Config;
        switch (config.mode) {
            case "html":
                const testMsg: TestMsg = {
                    type: MsgType.TEST,
                    testType: "fetch-html",
                    address: config.address,
                    elements: (config as HtmlModeConfig).elements,
                }

                notifier.show("Fetching...");
                chrome.runtime.sendMessage(testMsg, (response) => {
                    notifier.show("Fetched.");
                    for (const table of response.tablesMap) {
                        if (table[1] && table[1].entriesList) {
                            table[1].entriesList = table[1].entriesList.map(entry => JSON.parse(entry));
                        }
                    }
                    jsonViewer.setContent(response);
                });
        }
    });
    $("#tabs-btn").on("click", () => {
        const config: Config = configEditor.getContent() as Config;
        const testMsg: TestMsg = {
            type: MsgType.TEST,
            testType: "tabs",
            address: config.address
        }

        notifier.show("Getting...");
        chrome.runtime.sendMessage(testMsg, response => {
            notifier.show("Got.");
            jsonViewer.setContent(response);
        });
    })

    // save config when window closed
    $(window).on("blur", () => {
        chrome.storage.local.set({
            "config": configEditor.getContent()
        });
    })
})
