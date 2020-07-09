// source: dbmonitor_service.proto
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

var common_pb = require('./common_pb.js');
goog.object.extend(proto, common_pb);
goog.exportSymbol('proto.darcher.ControlMsg', null, global);
goog.exportSymbol('proto.darcher.DBContent', null, global);
goog.exportSymbol('proto.darcher.RequestType', null, global);
goog.exportSymbol('proto.darcher.TableContent', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.darcher.ControlMsg = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.darcher.ControlMsg, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.darcher.ControlMsg.displayName = 'proto.darcher.ControlMsg';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.darcher.TableContent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.darcher.TableContent.repeatedFields_, null);
};
goog.inherits(proto.darcher.TableContent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.darcher.TableContent.displayName = 'proto.darcher.TableContent';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.darcher.DBContent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.darcher.DBContent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.darcher.DBContent.displayName = 'proto.darcher.DBContent';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.darcher.ControlMsg.prototype.toObject = function(opt_includeInstance) {
  return proto.darcher.ControlMsg.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.darcher.ControlMsg} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.darcher.ControlMsg.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    type: jspb.Message.getFieldWithDefault(msg, 2, 0),
    dbAddress: jspb.Message.getFieldWithDefault(msg, 3, ""),
    dbName: jspb.Message.getFieldWithDefault(msg, 4, ""),
    data: msg.getData_asB64(),
    err: jspb.Message.getFieldWithDefault(msg, 6, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.darcher.ControlMsg}
 */
proto.darcher.ControlMsg.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.darcher.ControlMsg;
  return proto.darcher.ControlMsg.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.darcher.ControlMsg} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.darcher.ControlMsg}
 */
proto.darcher.ControlMsg.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {!proto.darcher.RequestType} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDbAddress(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDbName(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setData(value);
      break;
    case 6:
      var value = /** @type {!proto.darcher.Error} */ (reader.readEnum());
      msg.setErr(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.darcher.ControlMsg.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.darcher.ControlMsg.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.darcher.ControlMsg} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.darcher.ControlMsg.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getDbAddress();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getDbName();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getData_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getErr();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.darcher.ControlMsg.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.darcher.ControlMsg} returns this
 */
proto.darcher.ControlMsg.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional RequestType type = 2;
 * @return {!proto.darcher.RequestType}
 */
proto.darcher.ControlMsg.prototype.getType = function() {
  return /** @type {!proto.darcher.RequestType} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.darcher.RequestType} value
 * @return {!proto.darcher.ControlMsg} returns this
 */
proto.darcher.ControlMsg.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional string db_address = 3;
 * @return {string}
 */
proto.darcher.ControlMsg.prototype.getDbAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.darcher.ControlMsg} returns this
 */
proto.darcher.ControlMsg.prototype.setDbAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string db_name = 4;
 * @return {string}
 */
proto.darcher.ControlMsg.prototype.getDbName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.darcher.ControlMsg} returns this
 */
proto.darcher.ControlMsg.prototype.setDbName = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional bytes data = 5;
 * @return {!(string|Uint8Array)}
 */
proto.darcher.ControlMsg.prototype.getData = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes data = 5;
 * This is a type-conversion wrapper around `getData()`
 * @return {string}
 */
proto.darcher.ControlMsg.prototype.getData_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getData()));
};


/**
 * optional bytes data = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getData()`
 * @return {!Uint8Array}
 */
proto.darcher.ControlMsg.prototype.getData_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getData()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.darcher.ControlMsg} returns this
 */
proto.darcher.ControlMsg.prototype.setData = function(value) {
  return jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * optional Error err = 6;
 * @return {!proto.darcher.Error}
 */
proto.darcher.ControlMsg.prototype.getErr = function() {
  return /** @type {!proto.darcher.Error} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.darcher.Error} value
 * @return {!proto.darcher.ControlMsg} returns this
 */
proto.darcher.ControlMsg.prototype.setErr = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.darcher.TableContent.repeatedFields_ = [1,2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.darcher.TableContent.prototype.toObject = function(opt_includeInstance) {
  return proto.darcher.TableContent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.darcher.TableContent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.darcher.TableContent.toObject = function(includeInstance, msg) {
  var f, obj = {
    keypathList: (f = jspb.Message.getRepeatedField(msg, 1)) == null ? undefined : f,
    entriesList: (f = jspb.Message.getRepeatedField(msg, 2)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.darcher.TableContent}
 */
proto.darcher.TableContent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.darcher.TableContent;
  return proto.darcher.TableContent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.darcher.TableContent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.darcher.TableContent}
 */
proto.darcher.TableContent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.addKeypath(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.addEntries(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.darcher.TableContent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.darcher.TableContent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.darcher.TableContent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.darcher.TableContent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getKeypathList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      1,
      f
    );
  }
  f = message.getEntriesList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      2,
      f
    );
  }
};


/**
 * repeated string keyPath = 1;
 * @return {!Array<string>}
 */
proto.darcher.TableContent.prototype.getKeypathList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.darcher.TableContent} returns this
 */
proto.darcher.TableContent.prototype.setKeypathList = function(value) {
  return jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.darcher.TableContent} returns this
 */
proto.darcher.TableContent.prototype.addKeypath = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.darcher.TableContent} returns this
 */
proto.darcher.TableContent.prototype.clearKeypathList = function() {
  return this.setKeypathList([]);
};


/**
 * repeated string entries = 2;
 * @return {!Array<string>}
 */
proto.darcher.TableContent.prototype.getEntriesList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.darcher.TableContent} returns this
 */
proto.darcher.TableContent.prototype.setEntriesList = function(value) {
  return jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.darcher.TableContent} returns this
 */
proto.darcher.TableContent.prototype.addEntries = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.darcher.TableContent} returns this
 */
proto.darcher.TableContent.prototype.clearEntriesList = function() {
  return this.setEntriesList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.darcher.DBContent.prototype.toObject = function(opt_includeInstance) {
  return proto.darcher.DBContent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.darcher.DBContent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.darcher.DBContent.toObject = function(includeInstance, msg) {
  var f, obj = {
    tablesMap: (f = msg.getTablesMap()) ? f.toObject(includeInstance, proto.darcher.TableContent.toObject) : []
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.darcher.DBContent}
 */
proto.darcher.DBContent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.darcher.DBContent;
  return proto.darcher.DBContent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.darcher.DBContent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.darcher.DBContent}
 */
proto.darcher.DBContent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = msg.getTablesMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.darcher.TableContent.deserializeBinaryFromReader, "", new proto.darcher.TableContent());
         });
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.darcher.DBContent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.darcher.DBContent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.darcher.DBContent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.darcher.DBContent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTablesMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(1, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.darcher.TableContent.serializeBinaryToWriter);
  }
};


/**
 * map<string, TableContent> tables = 1;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.darcher.TableContent>}
 */
proto.darcher.DBContent.prototype.getTablesMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.darcher.TableContent>} */ (
      jspb.Message.getMapField(this, 1, opt_noLazyCreate,
      proto.darcher.TableContent));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.darcher.DBContent} returns this
 */
proto.darcher.DBContent.prototype.clearTablesMap = function() {
  this.getTablesMap().clear();
  return this;};


/**
 * @enum {number}
 */
proto.darcher.RequestType = {
  GET_ALL_DATA: 0,
  REFRESH_PAGE: 1
};

goog.object.extend(exports, proto.darcher);
