/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

;;;var ULOG = Logger.getLogger('com.kaazing.gateway.client.loader.Utils');
    
/**
 * Given a key, returns the value of the content attribute of the first
 * meta tag with a name attribute matching that key.
 *
 * @internal
 * @ignore
 */
var getMetaValue = function(key) {
    ;;;ULOG.entering(this, 'Utils.getMetaValue', key);
    // get all meta tags
    var tags = document.getElementsByTagName("meta");

    // find tag with name matching key
    for(var i=0; i < tags.length; i++) {
        if (tags[i].name === key) {
            var v = tags[i].content;
            ;;;ULOG.exiting(this, 'Utils.getMetaValue', v);
            return v;
        }
    }
    ;;;ULOG.exiting(this, 'Utils.getMetaValue');
}

var arrayCopy = function(array) {
    ;;;ULOG.entering(this, 'Utils.arrayCopy', array);
    var newArray = [];
    for (var i=0; i<array.length; i++) {
        newArray.push(array[i]);
    }
    return newArray;
}

var arrayFilter = function(array, callback) {
    ;;;ULOG.entering(this, 'Utils.arrayFilter', {'array':array, 'callback':callback});
    var newArray = [];
    for (var i=0; i<array.length; i++) {
        var elt = array[i];
        if(callback(elt)) {
            newArray.push(array[i]);
        }
    }
    return newArray;
}

var indexOf = function(array, searchElement) {
    ;;;ULOG.entering(this, 'Utils.indexOf', {'array':array, 'searchElement':searchElement});
    for (var i=0; i<array.length; i++) {
        if (array[i] == searchElement) {
            ;;;ULOG.exiting(this, 'Utils.indexOf', i);
            return i;
        }
    }
    ;;;ULOG.exiting(this, 'Utils.indexOf', -1);
    return -1;
}

/**
 * Given a byte string, decode as a UTF-8 string
 * @private
 * @ignore
 */
var decodeByteString = function(s) {
    ;;;ULOG.entering(this, 'Utils.decodeByteString', s);
    var a = [];
    for (var i=0; i<s.length; i++) {
        a.push(s.charCodeAt(i) & 0xFF);
    }
    var buf = new $rootModule.ByteBuffer(a);
    var v = getStringUnterminated(buf, Charset.UTF8);
    ;;;ULOG.exiting(this, 'Utils.decodeByteString', v);
    return v;
}

/**
 * Given an arrayBuffer, decode as a UTF-8 string
 * @private
 * @ignore
 */
var decodeArrayBuffer = function(array) {
    ;;;ULOG.entering(this, 'Utils.decodeArrayBuffer', array);
    var buf = new Uint8Array(array);
    var a = [];
    for (var i=0; i<buf.length; i++) {
        a.push(buf[i]);
    }
    var buf = new $rootModule.ByteBuffer(a);
    var s = getStringUnterminated(buf, Charset.UTF8);
    ;;;ULOG.exiting(this, 'Utils.decodeArrayBuffer', s);
    return s;
}

/**
 * Given an arrayBuffer, decode as a $rootModule.ByteBuffer
 * @private
 * @ignore
 */
var decodeArrayBuffer2ByteBuffer = function(array) {
    ;;;ULOG.entering(this, 'Utils.decodeArrayBuffer2ByteBuffer');
    var buf = new Uint8Array(array);
    var a = [];
    for (var i=0; i<buf.length; i++) {
        a.push(buf[i]);
    }
    ;;;ULOG.exiting(this, 'Utils.decodeArrayBuffer2ByteBuffer');
    return new $rootModule.ByteBuffer(a);
}

var ESCAPE_CHAR = String.fromCharCode(0x7F);
var NULL = String.fromCharCode(0);
var LINEFEED = "\n";

/**
 * Convert a ByteBuffer into an escaped and encoded string
 * @private
 * @ignore
 */
var encodeEscapedByteString = function(buf) {
    ;;;ULOG.entering(this, 'Utils.encodeEscapedByte', buf);
    var a = [];
    while(buf.remaining()) {
        var n = buf.getUnsigned();
        var chr = String.fromCharCode(n);
        switch(chr) {
            case ESCAPE_CHAR:
                a.push(ESCAPE_CHAR);
                a.push(ESCAPE_CHAR);
                break;
            case NULL:
                a.push(ESCAPE_CHAR);
                a.push("0");
                break;
            case LINEFEED:
                a.push(ESCAPE_CHAR);
                a.push("n");
                break;
            default:
                a.push(chr);
        }

    }
    var v = a.join("");
    ;;;ULOG.exiting(this, 'Utils.encodeEscapedBytes', v);
    return v;
}

/**
 * Convert a ByteBuffer into a properly escaped and encoded string
 * @private
 * @ignore
 */
var encodeByteString = function(buf, requiresEscaping) {
    ;;;ULOG.entering(this, 'Utils.encodeByteString', {'buf':buf, 'requiresEscaping': requiresEscaping});
    if (requiresEscaping) {
        return encodeEscapedByteString(buf);
    } else {
    	// obtain the array without copying if possible
		var array = buf.array;
		var bytes = (buf.position == 0 && buf.limit == array.length) ? array : buf.getBytes(buf.remaining());

		// update the array to use unsigned values and \u0100 for \u0000 (due to XDR bug)
        var sendAsUTF8 = !(XMLHttpRequest.prototype.sendAsBinary);
		for (var i=bytes.length-1; i >= 0; i--) {
		    var element = bytes[i];
		    if (element == 0 && sendAsUTF8) {
		        bytes[i] = 0x100;
		    }
		    else if (element < 0) {
		        bytes[i] = element & 0xff;
		    }
		}

        var encodedLength = 0;
        var partsOfByteString = [];

        do {
            var amountToEncode = Math.min(bytes.length - encodedLength, 10000);
            partOfBytes = bytes.slice(encodedLength, encodedLength + amountToEncode);
            encodedLength += amountToEncode;
		    partsOfByteString.push(String.fromCharCode.apply(null, partOfBytes));
        } while ( encodedLength < bytes.length);

		// convert UTF-8 char codes to String
        var byteString = partsOfByteString.join("");	

		// restore original byte values for \u0000
		if (bytes === array) {
			for (var i=bytes.length-1; i >= 0; i--) {
			    var element = bytes[i];
			    if (element == 0x100) {
			        bytes[i] = 0;
			    }
			}
		}

        ;;;ULOG.exiting(this, 'Utils.encodeByteString', byteString);
        return byteString;
    }
}

/**
 * UTF8 Decode an entire ByteBuffer (ignoring "null termination" because 0 is a
 *      valid character code!
 * @private
 * @ignore
 */
var getStringUnterminated = function(buf, cs) {
  var newLimit = buf.position;
  var oldLimit = buf.limit;
  var array = buf.array;
  while (newLimit < oldLimit) {
    newLimit++;
  }
  try {
      buf.limit = newLimit;
      return cs.decode(buf);
  }
  finally {
      if (newLimit != oldLimit) {
          buf.limit = oldLimit;
          buf.position = newLimit + 1;
      }
  }
};
