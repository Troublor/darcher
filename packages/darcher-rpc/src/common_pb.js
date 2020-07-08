// source: common.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.darcher.Error', null, global);
goog.exportSymbol('proto.darcher.Role', null, global);
goog.exportSymbol('proto.darcher.TxState', null, global);
/**
 * @enum {number}
 */
proto.darcher.Role = {
  DOER: 0,
  TALKER: 1
};

/**
 * @enum {number}
 */
proto.darcher.Error = {
  NILERR: 0,
  INTERNALERR: 1,
  TIMEOUTERR: 2,
  SERVICENOTAVAILABLEERR: 3
};

/**
 * @enum {number}
 */
proto.darcher.TxState = {
  CREATED: 0,
  PENDING: 1,
  EXECUTED: 2,
  DROPPED: 3,
  CONFIRMED: 4
};

goog.object.extend(exports, proto.darcher);
