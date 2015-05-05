/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * Data and framing layer for the AMQP protocol
 *
 * @constructor
 * @private
 * @class  AmqpBuffer extends ByteBuffer to add support for AMQP primative and
 *          compound types.
 */

var AmqpBuffer = function(bytes) {
    this.array = bytes || [];
    this._mark = -1;
    this.limit = this.capacity = this.array.length;
    // Default to network byte order
    this.order = $rootModule.ByteOrder.BIG_ENDIAN;

    // consecutive bit counter for bit packing
    this.bitCount = 0;
};

AmqpBuffer.prototype = new $rootModule.ByteBuffer();

var _assert = function(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
};

var _typeCodecMap = {
    "octet" : "Unsigned",
    "short" : "UnsignedShort",
    "long" : "UnsignedInt",
    "longlong" : "UnsignedLong",
    "int" : "Int",
    "table" : "Table",
    "longstr" : "LongString",
    "shortstr": "ShortString",
    "bit" : "Bit",
    "fieldtable" : "FieldTable",
    "timestamp" : "Timestamp",
    "void" : "Void"
};

// 4.2.1 Formal Protocol Grammar
var _typeIdentifierMap = {
/*    "t" : "octet",
    "b" : /
    "B" : "octet",
    "U" :
    "u" : "short"
    "I" : "int",
    "i" :
    "L" :
    "l" :
    "f" :
    "d" :
    "D" :
    "s" :
    "S" : "longstr",
    "A" :
    "T" : "table",
    "F" :
    "V" : "void"
*/
    "F" : "fieldtable",
    "S" : "longstr",
    "I" : "int",
    "V" : "void"
}


var _typeNameMap = {

    "longstr" : "S",
    "int"  : "I",
    "void" : "V"
}

/**
 * Encodes the AMQPLAIN authentication response as an AmqpTable
 * @private
 */
var _encodeAuthAmqPlain = function(username, password) {
    var bytes = new AmqpBuffer();
    bytes.putShortString("LOGIN");
        bytes.putTypeIdentifier("longstr");
    bytes.putLongString(username);

    bytes.putShortString("PASSWORD");
        bytes.putTypeIdentifier("longstr");
    bytes.putLongString(password);
    bytes.rewind();

    var len = bytes.remaining();
    var chars = [];
    for (var i=0; i<len; i++) {
        chars.push(String.fromCharCode(bytes.getUnsigned()));
    }
    return chars.join("");
};

var _encodeAuthPlain = function(username, password) {
    // OpenAmq uses (SASL)PLAIN authentication instead of
    // AMQPLAIN
    // 0 username 0 password
    throw new Error("AMQPLAIN not implemented");
};



/**
 * getLongString returns an AMQP long string, which is a string prefixed
 * by a unsigned 32 bit integer.
 *
 * @public
 * @function
 * @name getLongString
 * @memberOf AmqpBuffer
 */
AmqpBuffer.prototype.getLongString = function() {
    var len = this.getUnsignedInt();
    var chars = [];
    for (var i=0; i<len; i++) {
        chars.push(String.fromCharCode(this.getUnsigned()));
    }
    return chars.join("");
};

AmqpBuffer.prototype.getShortString = function() {
    var len = this.getUnsigned();
    var chars = [];
    for (var i=0; i<len; i++) {
        chars.push(String.fromCharCode(this.getUnsigned()));
    }
    return chars.join("");
};

// getVoid was added to support Void type header(header value is null).
AmqpBuffer.prototype.getVoid = function() {
};

AmqpBuffer.prototype.getTypeIdentifier = function() {
    var i = this.getUnsigned();
    return _typeIdentifierMap[String.fromCharCode(i)];
};

AmqpBuffer.prototype.putTypeIdentifier = function(type) {
    var ti = _typeNameMap[type];
    this.putUnsigned(ti.charCodeAt(0));
};

AmqpBuffer.prototype.getFieldValue=function(){
    var typeCode = this.getUnsigned();
    switch(String.fromCharCode(typeCode)) {
    case 't':
        return !!this.getUnsigned();
    default:
        throw new Error("Decoding Error in AmqpBuffer: cannot decode field value")
    }
}

AmqpBuffer.prototype.getFieldTable=function(){
    // length of field table
    var l = this.getUnsignedInt();
    // empty table
    var ft = {};

    var initial = this.position;
    while(l > (this.position - initial)) {
        var key = this.getShortString();
        var value = this.getFieldValue();
        ft[key] = value;
    }
    return ft;
}

AmqpBuffer.prototype.getTable = function() {
    var table = new AmqpArguments();
    var len = this.getUnsignedInt();
    
    // get the table sliced out;
    var bytes = new AmqpBuffer(this.array.slice(this.position, this.position+len));
    this.position += len;

    while (bytes.remaining()) {
        var kv = {};
        kv.key = bytes.getShortString();
        var ti = bytes.getTypeIdentifier();
        kv.value = bytes["get"+_typeCodecMap[ti]]();        
        kv.type = _typeCodecMap[ti];
        table.push(kv);
    }

    return table;
};

/**
 * Returns the bit at the specified offset
 */
AmqpBuffer.prototype.getBit = function(offset) {
    
    return this.getUnsigned();
}

/**
 * Packs one (of possibly several) boolean values as bits into a single 8-bit
 * field.
 *
 * If the last value written was a bit, the buffer's bit flag is false.
 * If the buffer's bit flag is set, putBit will try to pack the current bit
 * value into the same byte.
 */
AmqpBuffer.prototype.putBit = function(v) {
    //log2("bit counter was: ", this.bitCount);
    if (this.bitCount > 0) {
        var lastByte = this.array[this.position-1];
        lastByte = v << this.bitCount | lastByte;
        this.array[this.position-1] = lastByte;
        //log2("last byte was", lastByte);
    } else {
        this.putUnsigned(v);
    }
};

AmqpBuffer.prototype.putUnsignedLong = function(v) {
    this.putInt(0);
    return this.putUnsignedInt(v);
};

AmqpBuffer.prototype.getUnsignedLong = function(v) {
    // For unsigned longs (8 byte integers)
    // throw away the first word, then read the next
    // word as an unsigned int
    this.getInt();
    return this.getUnsignedInt();
};


AmqpBuffer.prototype.putTimestamp = function(v) {
    var ts = v.getTime(); 
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 7; i >= 0; i--) {
        var b = v & 0xff;
        byteArray[i] = b;
        v = (v - b)/256;
    }
    this.putBytes(byteArray);
    return this;
};

AmqpBuffer.prototype.getTimestamp = function(v) {
    var bytes = this.getBytes(8);
    var val = 0;
    for(var i = 0; i < 8; i++) {
        val = val * 256 + (bytes[i] & 0xff);
    }
    return new Date(val);
};

AmqpBuffer.prototype.putLongString = function(s) {
    this.putUnsignedInt(s.length);
    for (var i=0; i<s.length; i++) {
        this.putUnsigned(s.charCodeAt(i));
    }
};

AmqpBuffer.prototype.putShortString = function(s) {
    this.putUnsigned(s.length);
    for (var i=0; i<s.length; i++) {
        this.putUnsigned(s.charCodeAt(i));
    }
};

// putVoid was added to support Void type header(header value is null).
AmqpBuffer.prototype.putVoid = function(s) {
};

AmqpBuffer.prototype.putTable = function(table) {
    // accept null arguments for table
    if (!table) {
        this.putUnsignedInt(0);
        return this;
    }


    var bytes = new AmqpBuffer();
    for (var i=0; i<table.length; i++) {
        var entry = table[i];
        bytes.putShortString(entry.key);
        bytes.putTypeIdentifier(entry.type);
        bytes["put" + _typeCodecMap[entry.type]](entry.value);
    }

    bytes.rewind();
    this.putUnsignedInt(bytes.remaining());
    this.putBuffer(bytes);

    return this;
};

////////////////////////////////////////////////////////////////////////////////
// frame types
////////////////////////////////////////////////////////////////////////////////

AmqpBuffer.prototype.getFrameHeader = function() {
    var frameType = this.getUnsigned();
    var channel = this.getUnsignedShort();
    var size = this.getUnsignedInt();

    var header = {}
    header.type = frameType;
    header.size = size;
    header.channel = channel;

    return header;
};

AmqpBuffer.prototype.getFrame = function() {
    var pos = this.position;
    var frame = {};

    // If there is at least one frame in the buffer, attempt to decode it.
    if (this.remaining() > 7) {
        


        frame.header = this.getFrameHeader();
        frame.channel = frame.header.channel;
        frame.type = frame.header.type;

        // the buffer must have an additional byte for the frame end marker
        if (this.remaining() >= frame.header.size + 1) {


            switch (frame.type) {
                case _constants.FRAME_BODY.value:
                    // get the body sliced out;
                    var body = new AmqpBuffer(this.array.slice(this.position, this.position+frame.header.size));
                    this.position += frame.header.size;
                    frame.body = body;

                    frame.methodName = "body";
                    break;
                case _constants.FRAME_HEADER.value:
                    var classIndex = this.getUnsignedShort();
                    var weight = this.getUnsignedShort();
                    var bodySize = this.getUnsignedLong();

                    frame.contentProperties = this.getContentProperties();
                    frame.methodName = "header";
                    break;
                case _constants.FRAME_METHOD.value:
                    var classIndex = this.getUnsignedShort();
                    var methodIndex = this.getUnsignedShort();

                    var clzname = _classLookup[classIndex].className;
                    var methodName = _classLookup[classIndex].methodLookup[methodIndex];

                    var method = _classLookup[classIndex][methodName];
                    // pull paramater list off of method
                    var params = _classLookup[classIndex][methodName].allParameters;

                    frame.methodName = methodName;
                    frame.args = this.getMethodArguments(params);
                    break;

                case 4:                                 // Heartbeat in AMQP 0-9-1
                case _constants.FRAME_HEARTBEAT.value:  // Heartbeat in RabbitMQ 
                    throw new Error("Received heartbeat frame even though the client has expressed no interest in heartbeat via tune-ok method.");

                default:
                    throw new Error("Unrecognized AMQP 0-9-1 Frame type = " + frame.type);
                    break;
            }


            // Having read the frame, check frame end for terminator value
            _assert((this.getUnsigned() === _constants.FRAME_END.value), "AMQP: Frame terminator missing");

        } else {
            //log2("bailing out", this.remaining(), header.size)
            this.position = pos;
            return null;
        }
        return frame;
    }
    //log2("bailing out2", this.remaining());
    return null;
};


AmqpBuffer.prototype.putFrame = function(type, channel, payload) {
    this.putUnsigned(type);
    this.putUnsignedShort(channel);

    // compute size from payload bytes
    var size = payload.remaining();
    this.putUnsignedInt(size);
    this.putBuffer(payload);

    // write terminator
    this.putUnsigned(_constants.FRAME_END.value);
    return this;
};


AmqpBuffer.prototype.putMethodFrame = function(method, channel, args) {
    var payload = new AmqpBuffer();
    payload.putUnsignedShort(method.classIndex);
    payload.putUnsignedShort(method.index);
    payload.putMethodArguments(args, method.allParameters);
    payload.flip();

    return this.putFrame(_constants.FRAME_METHOD.value, channel, payload);
};

AmqpBuffer.prototype.putHeaderFrame = function(channel, classIndex, weight, bodySize, properties) {
    var payload = new AmqpBuffer();

    payload.putUnsignedShort(classIndex);
    payload.putUnsignedShort(weight);
    payload.putUnsignedLong(bodySize);
    // headers have properties
    payload.putContentProperties(properties);

    payload.flip();
    return this.putFrame(_constants.FRAME_HEADER.value, channel, payload);
};


AmqpBuffer.prototype.putBodyFrame = function(channel, payload) {
    return this.putFrame(_constants.FRAME_BODY.value, channel, payload);
};

AmqpBuffer.prototype.putHeartbeat = function() {
    throw new Error("Heartbeat not implemented");
};


/**
 * Encodes arguments given a method's parameter list and the provided arguments
 */
AmqpBuffer.prototype.putMethodArguments = function(args, formalParams) {
    for (var i=0; i<formalParams.length; i++) {
        var p = formalParams[i];
        // lookup type
        var dtype = p.type;
        // TODO check assertions on amqp types
        var domain = _domains[dtype];
        if (domain) {
            var type = domain.type;
        } else {
            throw new Error("Unknown AMQP domain " + dtype);
        }
        this["put"+_typeCodecMap[type]](args[i]);

        // support packing of consecutive bits into a single byte
        this.bitCount = (type === "bit") ? this.bitCount+1 : 0;
    }
    return this;
};

/**
 * Decodes arguments given a method's parameter list
 */
AmqpBuffer.prototype.getMethodArguments = function(params) {
    var values = [];
    for (var i=0; i<params.length; i++) {
        var p = params[i];
        // lookup type
        var dtype = p.type;
        // TODO check assertions on amqp types
        var type = _domains[dtype].type;
        
        var arg = {}
        arg.type = type;
        arg.name = p.name;
        try {
            var v = this["get"+_typeCodecMap[type]]();
        } catch (e) {
            throw new Error("type codec failed for type " + type + " for domain " + dtype);
        }

        // support unpacking of consecutive bits from a single byte
        this.bitCount = (type === "bit") ? this.bitCount+1 : 0;

        arg.value = v;
        values.push(arg);
    }
    return values;
};

/**
 * Writes typed arguments for AMQP methods and content properties
 */
AmqpBuffer.prototype.putArgument = function(domainName, arg) {
    var domain = _domains[domainName];
    if (domain) {
        var type = domain.type;
    } else {
        throw new Error("Unknown AMQP domain " + dtype);
    }
    this["put"+_typeCodecMap[type]](arg);
}

/**
 * Reads typed arguments for AMQP methods and content properties
 */
AmqpBuffer.prototype.getArgument = function(type) {
    try {
        return this["get"+_typeCodecMap[type]]();
    } catch (e) {
        throw new Error("type codec failed for type " + type + " for domain " + dtype);
    }
};

////////////////////////////////////////////////////////////////////////////////
// Content properties
//
// Content properties are optional, binary headers.
// The format for content properties is:
// 1) bit flags packed into 2 or more bytes
//      -the last bit (16th bit) signals whether or not there are more flags
// 2) values for the properties which had flags set to 1
//
// The types for these arguments are given in _basicProperties, which is
//   generated from the amqp spec xml.
//
////////////////////////////////////////////////////////////////////////////////

AmqpBuffer.prototype.getContentProperties = function() {
    var contentProperties = {};

    var propertyFlags = [];
    var packedPropertyFlags = this.getUnsignedShort();

    // 16 is the size of the unsigned short integer in which content properties
    // are packed
    for (var i=0; i<=16; i++) {
        var bit = (packedPropertyFlags >> (i)) & 0x01;
        if (bit) {
            // remember the index of any set flags
            propertyFlags.unshift(i+1);
        }
    }
    // After the content property flags are read, we know which properties
    // to read.
    for (var i=0; i<propertyFlags.length; i++) {
            var k = 16 - propertyFlags[i];
            var propertyName = _basicProperties[k].name;
            var propertyDomain = _basicProperties[k].domain;
            var propertyType = _domains[propertyDomain];
            contentProperties[propertyName] = this.getArgument(propertyType.type);
    }

    return contentProperties;
};

AmqpBuffer.prototype.putContentProperties = function(contentProperties) {
    // If no properties are specified, put an unsigned short and return
    if (!contentProperties) {
        return this.putUnsignedShort(0);
    }

    // create empty unsigned short to fill with property flags
    var packedPropertyFlags = 0x00;

    var properties = [];
    for (var i=0; i<_basicProperties.length; i++) {
        var propertyName = _basicProperties[i].name;
        var domain = _basicProperties[i].domain;
        var propertyValue = contentProperties[propertyName];

        if (typeof(propertyValue) !== "undefined") {
            properties.push({"propertyName" : propertyName, "propertyValue" : propertyValue, "domain" : domain});
            // shift and write property flag as bit
            packedPropertyFlags = packedPropertyFlags << 1 | 0x1;
        } else {
            // just shift
            packedPropertyFlags = packedPropertyFlags << 1;
        }


    }

    // There are 14 properties in AMQP 0-9-x
    //  and the continue bit will always be false
    //  always shift 2
    packedPropertyFlags = packedPropertyFlags << 2;


    // write out the property flags
    this.putUnsignedShort(packedPropertyFlags);
    
    // write each property
    for (var i=0; i<properties.length; i++) {
        var property = properties[i];
        var propertyDomain = property.domain;
        this.putArgument(propertyDomain, property.propertyValue);
    }
    return this;
};
