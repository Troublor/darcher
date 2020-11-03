/* eslint-disable */

import {ControlMsg, DBContent, RequestType, TableContent} from "./dbmonitor-rpc/dbmonitor_service_pb";
import {Error} from "./dbmonitor-rpc/common_pb";

export class Logger {
  static LevelVerbose = 1;
  static LevelDebug = 2;
  static LevelInfo = 3;
  static LevelWarn = 4;
  static LevelError = 5;

  constructor(level) {
    this.level = level;
  }

  log(level, ...messages) {
    if (this.level >= level) {
      console.log(...messages);
    }
  }

  info(...messages) {
    this.log(Logger.LevelInfo, ...messages);
  }

  warn(...messages) {
    this.log(Logger.LevelWarn, ...messages);
  }

  debug(...messages) {
    this.log(Logger.LevelDebug, ...messages);
  }

  error(...messages) {
    this.log(Logger.LevelError, ...messages);
  }

  verbose(...messages) {
    this.log(Logger.LevelVerbose, ...messages);
  }
}

export class StorageMonitor {
  constructor(darcherUrl) {
    this.logger = new Logger(Logger.LevelDebug);
    this.darcherUrl = darcherUrl;
  }

  start() {
    this.ws = new WebSocket(this.darcherUrl);
    this.ws.onopen = this.onWsOpened.bind(this);
    this.ws.onclose = this.onWsClosed.bind(this);
    this.ws.onerror = this.onWsError.bind(this);
    this.ws.onmessage = this.onWsMessage.bind(this);
  }

  onWsOpened() {
    this.logger.info("Websocket connection with DArcher connected");
  }

  onWsClosed() {
    this.logger.info("Websocket connection with DArcher disconnected")
  }

  onWsError(e) {
    this.logger.error(e);
  }

  async onWsMessage(message) {
    let request = ControlMsg.deserializeBinary(new Uint8Array(await message.data.arrayBuffer()));
    switch (request.getType()) {
      case RequestType.GET_ALL_DATA:
        this.getAllData().then(data => {
          data = Uint8Array.from(data);
          request.setData(data);
          this.ws.send(request.serializeBinary());
          this.logger.debug("sent getAllData response: ", request);
        }).then(e => {
          this.logger.error("getAllData error: ", e);
          request.setErr(Error.INTERNALERR);
          this.ws.send(request.serializeBinary());
        });
        break;
      case RequestType.REFRESH_PAGE:
        this.logger.debug("receive RefreshPage request");
        this.ws.send(request.serializeBinary());
    }
  }

  async getAllData() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(data => {
          this.logger.debug("get all data: ", data);
          // special db content, only has one table and one entry, no key path
          let content = new DBContent();
          let tableContent = new TableContent();
          tableContent.setKeypathList([]);
          tableContent.addEntries(JSON.stringify(data));
          content.getTablesMap().set("storage", tableContent);
          resolve(content.serializeBinary());
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
