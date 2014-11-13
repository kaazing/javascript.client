/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

(function($module) {

    if (typeof $module.ByteBuffer === "undefined") {
        /**
	     * Creates a new ByteBuffer instance.
	     *
	     * @param {Array} bytes  the byte-valued Number array
	     *
	     * @constructor
	     *
	     * @class  ByteBuffer provides a compact byte array representation for 
	     *         sending, receiving and processing binary data using WebSocket.
	     */
		var ByteBuffer = function(bytes) {
			this.array = bytes || [];
		    this._mark = -1;
		    this.limit = this.capacity = this.array.length;
		    // Default to network byte order
		    this.order = $module.ByteOrder.BIG_ENDIAN;
		}
		
		
	    /**
	     * Allocates a new ByteBuffer instance.
	     * The new buffer's position will be zero, its limit will be its capacity,
	     * and its mark will be undefined. 
	     *
	     * @param {Number} capacity  the maximum buffer capacity
	     *
	     * @return {ByteBuffer} the allocated ByteBuffer 
	     *
	     * @public
	     * @static
	     * @function
	     * @memberOf ByteBuffer
	     */
	    ByteBuffer.allocate = function(capacity) {
	        var buf = new ByteBuffer();
	        buf.capacity = capacity;
	
	        // setting limit to the given capacity, other it would be 0...
	        buf.limit = capacity;
	        return buf;
	    };
	    
	    /**
	     * Wraps a byte array as a new ByteBuffer instance.
	     *
	     * @param {Array} bytes  an array of byte-sized numbers
	     *
	     * @return {ByteBuffer} the bytes wrapped as a ByteBuffer 
	     *
	     * @public
	     * @static
	     * @function
	     * @memberOf ByteBuffer
	     */
	    ByteBuffer.wrap = function(bytes) {
	      return new ByteBuffer(bytes);
	    };
	
	    var $prototype = ByteBuffer.prototype;
	    
	    /**
	     * The autoExpand property enables writing variable length data,
	     * and is on by default.
	     *
	     * @public
	     * @field
	     * @name autoExpand
	     * @type Boolean
	     * @memberOf ByteBuffer
	     */
	    $prototype.autoExpand = true;
	
	    /**
	     * The capacity property indicates the maximum number of bytes
	     * of storage available if the buffer is not automatically expanding.
	     *
	     * @public
	     * @field
	     * @name capacity
	     * @type Number
	     * @memberOf ByteBuffer
	     */
	    $prototype.capacity = 0;
	    
	    /**
	     * The position property indicates the progress through the buffer,
	     * and indicates the position within the underlying array that
	     * subsequent data will be read from or written to.
	     *
	     * @public
	     * @field
	     * @name position
	     * @type Number
	     * @memberOf ByteBuffer
	     */
	    $prototype.position = 0;
	    
	    /**
	     * The limit property indicates the last byte of data available for 
	     * reading.
	     *
	     * @public
	     * @field
	     * @name limit
	     * @type Number
	     * @memberOf ByteBuffer
	     */
	    $prototype.limit = 0;
	
	
	    /**
	     * The order property indicates the endianness of multibyte integer types in
	     * the buffer.
	     *
	     * @public
	     * @field
	     * @name order
	     * @type ByteOrder
	     * @memberOf ByteBuffer
	     */
	    $prototype.order = $module.ByteOrder.BIG_ENDIAN;
	    
	    /**
	     * The array property provides byte storage for the buffer.
	     *
	     * @public
	     * @field
	     * @name array
	     * @type Array
	     * @memberOf ByteBuffer
	     */
	    $prototype.array = [];
	    
	    /**
	     * Marks a position in the buffer.
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @see ByteBuffer#reset
	     *
	     * @public
	     * @function
	     * @name mark
	     * @memberOf ByteBuffer
	     */
	    $prototype.mark = function() {
	      this._mark = this.position;
	      return this;
	    };
	    
	    /**
	     * Resets the buffer position using the mark.
	     *
	     * @throws {Error} if the mark is invalid
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @see ByteBuffer#mark
	     *
	     * @public
	     * @function
	     * @name reset
	     * @memberOf ByteBuffer
	     */
	    $prototype.reset = function() {
	      var m = this._mark;
	      if (m < 0) {
	        throw new Error("Invalid mark");
	      }
	      this.position = m;
	      return this;
	    };
	    
	    /**
	     * Compacts the buffer by removing leading bytes up
	     * to the buffer position, and decrements the limit
	     * and position values accordingly.
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name compact
	     * @memberOf ByteBuffer
	     */
	    $prototype.compact = function() {
	      this.array.splice(0, this.position);
	      this.limit -= this.position;
	      this.position = 0;
	      return this;
	    };
	    
	    /**
	     * Duplicates the buffer by reusing the underlying byte
	     * array but with independent position, limit and capacity.
	     *
	     * @return {ByteBuffer} the duplicated buffer
	     *
	     * @public
	     * @function
	     * @name duplicate
	     * @memberOf ByteBuffer
	     */
	    $prototype.duplicate = function() {
	      var buf = new ByteBuffer(this.array);
	      buf.position = this.position;
	      buf.limit = this.limit;
	      buf.capacity = this.capacity;
	      return buf;
	    };
	    
	    /**
	     * Fills the buffer with a repeated number of zeros.
	     *
	     * @param size  {Number}  the number of zeros to repeat
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name fill
	     * @memberOf ByteBuffer
	     */
	    $prototype.fill = function(size) {
	      _autoExpand(this, size);
	      while (size-- > 0) {
	        this.put(0);
	      }
	      return this;
	    };
	    
	    /**
	     * Fills the buffer with a specific number of repeated bytes.
	     *
	     * @param b     {Number}  the byte to repeat
	     * @param size  {Number}  the number of times to repeat
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name fillWith
	     * @memberOf ByteBuffer
	     */
	    $prototype.fillWith = function(b, size) {
	      _autoExpand(this, size);
	      while (size-- > 0) {
	        this.put(b);
	      }
	      return this;
	    };
	    
	    /**
	     * Returns the index of the specified byte in the buffer.
	     *
	     * @param b     {Number}  the byte to find
	     *
	     * @return {Number} the index of the byte in the buffer, or -1 if not found
	     *
	     * @public
	     * @function
	     * @name indexOf
	     * @memberOf ByteBuffer
	     */
	    $prototype.indexOf = function(b) {
	      var limit = this.limit;
	      var array = this.array;
	      for (var i=this.position; i < limit; i++) {
	        if (array[i] == b) {
	          return i;
	        }
	      }
	      return -1;
	    };
	    
	    /**
	     * Puts a single byte number into the buffer at the current position.
	     *
	     * @param v     {Number}  the single-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name put
	     * @memberOf ByteBuffer
	     */
	    $prototype.put = function(v) {
	       _autoExpand(this, 1);
	       this.array[this.position++] = v & 255;
	       return this;
	    };
	    
	    /**
	     * Puts a single byte number into the buffer at the specified index.
	     *
	     * @param index   {Number}  the index
	     * @param v       {Number}  the byte
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putAt = function(index, v) {
	       _checkForWriteAt(this,index,1);
	       this.array[index] = v & 255;
	       return this;
	    };
	
	    /**
	     * Puts an unsigned single-byte number into the buffer at the current position.
	     *
	     * @param v     {Number}  the single-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsigned
	     * @memberOf ByteBuffer
	     */
	     $prototype.putUnsigned = function(v) {
	        _autoExpand(this, 1);
	        this.array[this.position++] = v & 0xFF;
	        return this;
	    }
	    /**
	     * Puts an unsigned single byte into the buffer at the specified position.
	     *
	     * @param index  {Number}  the index
	     * @param v      {Number}  the single-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedAt
	     * @memberOf ByteBuffer
	     */
	     $prototype.putUnsignedAt = function(index, v) {
	    	_checkForWriteAt(this,index,1);
	    	this.array[index] = v & 0xFF;
	        return this;
	    }
	    /**
	     * Puts a two-byte short into the buffer at the current position.
	     *
	     * @param v     {Number} the two-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.putShort = function(v) {
	        _autoExpand(this, 2);
	        _putBytesInternal(this, this.position, this.order._fromShort(v));
	        this.position += 2;
	        return this;
	    };
	    
	    /**
	     * Puts a two-byte short into the buffer at the specified index.
	     *
	     * @param index  {Number}  the index
	     * @param v      {Number}  the two-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putShortAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putShortAt = function(index, v) {
	    	_checkForWriteAt(this,index,2);
	        _putBytesInternal(this, index, this.order._fromShort(v));
	        return this;
	    };
	    
	    /**
	     * Puts a two-byte unsigned short into the buffer at the current position.
	     *
	     * @param v     {Number}  the two-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.putUnsignedShort = function(v) {
	        _autoExpand(this, 2);
	        _putBytesInternal(this, this.position, this.order._fromShort(v & 0xFFFF));
	        this.position += 2;
	        return this;
	    }
	
	    /**
	     * Puts an unsigned two-byte unsigned short into the buffer at the position specified.
	     * 
	     * @param index     {Number}  the index
	     * @param v     {Number}  the two-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.putUnsignedShortAt = function(index, v) {
	    	_checkForWriteAt(this,index,2);
	        _putBytesInternal(this, index, this.order._fromShort(v & 0xFFFF));
	        return this;
	    }
	
	    /**
	     * Puts a three-byte number into the buffer at the current position.
	     *
	     * @param v     {Number}  the three-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putMediumInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putMediumInt = function(v) {
	       _autoExpand(this, 3);
	       this.putMediumIntAt(this.position, v);
	       this.position += 3;
	       return this;
	    };
	
	    /**
	     * Puts a three-byte number into the buffer at the specified index.
	     *
	     * @param index     {Number}  the index
	     * @param v     {Number}  the three-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putMediumIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putMediumIntAt = function(index, v) {
	        this.putBytesAt(index, this.order._fromMediumInt(v));
	        return this;
	    };
	
	    /**
	     * Puts a four-byte number into the buffer at the current position.
	     *
	     * @param v     {Number}  the four-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putInt = function(v) {
	        _autoExpand(this, 4);
	        _putBytesInternal(this, this.position, this.order._fromInt(v))
	        this.position += 4;
	        return this;
	    };
	    
	    /**
	     * Puts a four-byte number into the buffer at the specified index.
	     *
	     * @param index     {Number}  the index
	     * @param v     {Number}  the four-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putIntAt = function(index, v) {
	    	_checkForWriteAt(this,index,4);
	        _putBytesInternal(this, index, this.order._fromInt(v))
	        return this;
	    };
	    
	    /**
	     * Puts an unsigned four-byte number into the buffer at the current position.
	     *
	     * @param i     {Number}  the index
	     * 
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putUnsignedInt = function(v) {
	        _autoExpand(this, 4);
	        this.putUnsignedIntAt(this.position, v & 0xFFFFFFFF);
	        this.position += 4;
	        return this;
	    }
	
	    /**
	     * Puts an unsigned four-byte number into the buffer at the specified index.
	     *
	     * @param index     {Number}  the index
	     * @param v     {Number}  the four-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putUnsignedIntAt = function(index, v) {
	    	_checkForWriteAt(this,index,4);
	        this.putIntAt(index, v & 0xFFFFFFFF);
	        return this;
	    }
	
	    /**
	     * Puts a string into the buffer at the current position, using the
	     * character set to encode the string as bytes.
	     *
	     * @param v     {String}   the string
	     * @param cs    {Charset}  the character set
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putString
	     * @memberOf ByteBuffer
	     */
	    $prototype.putString = function(v, cs) {
	       cs.encode(v, this);
	       return this;
	    };
	    
	    /**
	     * Puts a string into the buffer at the specified index, using the
	     * character set to encode the string as bytes.
	     *
	     * @param fieldSize  {Number}   the width in bytes of the prefixed length field
	     * @param v          {String}   the string
	     * @param cs         {Charset}  the character set
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putPrefixedString
	     * @memberOf ByteBuffer
	     */
	    $prototype.putPrefixedString = function(fieldSize, v, cs) {
	        if (typeof(cs) === "undefined" || typeof(cs.encode) === "undefined") {
	            throw new Error("ByteBuffer.putPrefixedString: character set parameter missing");
	        }
	
	        if (fieldSize === 0) {
	            return this;
	        }
	    
	        _autoExpand(this, fieldSize);
	
	        var len = v.length;
	        switch (fieldSize) {
	          case 1:
	            this.put(len);
	            break;
	          case 2:
	            this.putShort(len);
	            break;
	          case 4:
	            this.putInt(len);
	            break;
	        }
	        
	        cs.encode(v, this);
	        return this;
	    };
	    
	    // encapsulates the logic to store byte array in the buffer
	    function _putBytesInternal($this, index, v) {
	        var array = $this.array;
	        for (var i = 0; i < v.length; i++) {
	            array[i + index] = v[i] & 255;
	        }
	    };
	    
	    /**
	     * Puts a single-byte array into the buffer at the current position.
	     *
	     * @param v     {Array}  the single-byte array
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putBytes
	     * @memberOf ByteBuffer
	     */
	    $prototype.putBytes = function(v) {
	        _autoExpand(this, v.length);
	        _putBytesInternal(this, this.position, v);
	        this.position += v.length;
	        return this;
	    };
	    
	    /**
	     * Puts a byte array into the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     * @param v     {Array}  the single-byte array
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putBytesAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putBytesAt = function(index, v) {
	    	_checkForWriteAt(this,index,v.length);
	        _putBytesInternal(this, index, v);
	        return this;
	    };
	    
	     /**
	     * Puts a ByteArray into the buffer at the current position.
	     *
	     * @param v     {ByteArray}  the ByteArray
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putByteArray
	     * @memberOf ByteBuffer
	     */
	    $prototype.putByteArray = function(v) {
	        _autoExpand(this, v.byteLength);
	        var u = new Uint8Array(v);
	        // copy bytes into ByteBuffer
	        for (var i=0; i<u.byteLength; i++) {
	        	this.putAt(this.position + i, u[i] & 0xFF);
	        }
	        this.position += v.byteLength;
	        return this;
	    };
	    /**
	     * Puts a buffer into the buffer at the current position.
	     *
	     * @param v     {Array}  the single-byte array
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putBuffer
	     * @memberOf ByteBuffer
	     */
	    $prototype.putBuffer = function(v) {
	    
	       var len = v.remaining();
	       _autoExpand(this, len);
	 	   
	       var sourceArray = v.array;
	       var sourceBufferPosition = v.position;
	       var currentPosition = this.position;
	       
	       for (var i = 0; i < len; i++) {
	           this.array[i + currentPosition] = sourceArray[i + sourceBufferPosition];
	       }
	       
	       this.position += len;
	       return this;
	    };
	
	    
	    /**
	     * Puts a buffer into the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     * @param v     {Array}  the single-byte array
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putBufferAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putBufferAt = function(index, v) {
	       var len = v.remaining();
	       _autoExpand(this, len);
	       
	       var sourceArray = v.array;
	       var sourceBufferPosition = v.position;
	       var currentPosition = this.position;
	       
	       for (var i = 0; i < len; i++) {
	           this.array[i + currentPosition] = sourceArray[i + sourceBufferPosition];
	       }
	       
	       return this;
	    };
	    
	    /**
	     * Returns a single-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the single-byte number
	     *
	     * @public
	     * @function
	     * @name get
	     * @memberOf ByteBuffer
	     */
	    $prototype.get = function() {
	      _checkForRead(this,1);
	      return this.order._toByte(this.array[this.position++]);
	    };
	
	    /**
	     * Returns a single-byte number from the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     *
	     * @return {Number}  the single-byte number
	     *
	     * @public
	     * @function
	     * @name getAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getAt = function(index) {
	    	_checkForReadAt(this,index,1);
	        return this.order._toByte(this.array[index]);
	    };
	
	    /**
	     * Returns an unsigned single-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the unsigned single-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsigned
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsigned = function() {
	    	_checkForRead(this,1);
	        var val = this.order._toUnsignedByte(this.array[this.position++]);
	        return val;
	    };
	    /**
	     * Returns an unsigned single-byte number from the buffer at the specified index.
	     *
	     * @param index  the index
	     *
	     * @return  the unsigned single-byte number
	     * @public
	     * @function
	     * @name getUnsignedAt
	     * @memberOf ByteBuffer
	
	     */
	    $prototype.getUnsignedAt = function(index) {
	    	_checkForReadAt(this,index,1);
	        return this.order._toUnsignedByte(this.array[index]);
	    }
	
	    /**
	     * Returns a n-byte number from the buffer at the current position.
	     *
	     * @param size     {Number} size the size of the buffer to be returned
	     *
	     * @return {Array}  a new byte array with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getBytes
	     * @memberOf ByteBuffer
	     */
	    $prototype.getBytes = function(size) {
	    	_checkForRead(this,size);
	        var byteArray = new Array();
	        for(var i=0; i<size; i++) {
	            byteArray.push(this.order._toByte(this.array[i+this.position]));
	        }
	        this.position += size;
	        return byteArray;
	    };
	
	    /**
	     * Returns a n-byte number from the buffer at the specified index.
	     *
	     * @param index    {Number} the index
	     * @param size     {Number} size the size of the buffer to be returned
	     *
	     * @return {Array}  a new byte array with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getBytes
	     * @memberOf ByteBuffer
	     */
	    $prototype.getBytesAt = function(index,size) {
	    	_checkForReadAt(this,index,size);
	        var byteArray = new Array();
	        var sourceArray = this.array;
	        for (var i = 0; i < size; i++) {
	         byteArray.push(sourceArray[i + index]);
	        }
	        return byteArray;
	    };
	
	    /**
	     * Returns a Blob from the buffer at the current position.
	     *
	     * @param size     {Number} size the size of the Blob to be returned
	     *
	     * @return {Blob}  a new Blob with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getBlob
	     * @memberOf ByteBuffer
	     */
	    $prototype.getBlob = function(size) {
	        var bytes = this.array.slice(this.position, size);
	        this.position += size;
	        return $module.BlobUtils.fromNumberArray(bytes);
	    }
	
	    /**
	     * Returns a Blob from the buffer at the specified index.
	     *
	     * @param index    {Number} the index
	     * @param size     {Number} size the size of the Blob to be returned
	     *
	     * @return {Blob}  a new Blob with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getBlobAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getBlobAt = function(index, size) {
	        var bytes = this.getBytesAt(index, size);
	        return $module.BlobUtils.fromNumberArray(bytes);
	
	    }
	    
	    /**
	     * Returns a ArrayBuffer from the buffer at the current position.
	     *
	     * @param size     {Number} size the size of the ArrayBuffer to be returned
	     *
	     * @return {ArrayBuffer}  a new ArrayBuffer with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getArrayBuffer
	     * @memberOf ByteBuffer
	     */
	    $prototype.getArrayBuffer = function(size) {
	    	 var u = new Uint8Array(size);
	         u.set(this.array.slice(this.position, size));
	         this.position += size;
	         return u.buffer;
	    }            	
	
	    /**
	     * Returns a two-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the two-byte number
	     *
	     * @public
	     * @function
	     * @name getShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.getShort = function() {
	    	_checkForRead(this,2);
	        var val = this.getShortAt(this.position);
	        this.position += 2;
	        return val;
	    };
	    
	    /**
	     * Returns a two-byte number from the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     *
	     * @return {Number}  the two-byte number
	     *
	     * @public
	     * @function
	     * @name getShortAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getShortAt = function(index) {
	    	_checkForReadAt(this,index,2);
	        var array = this.array;
	        return this.order._toShort(array[index++], array[index++]);
	    };
	
	    /**
	     * Returns an unsigned two-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the unsigned two-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsignedShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedShort = function() {
	    	_checkForRead(this,2);
	        var val = this.getUnsignedShortAt(this.position);
	        this.position += 2;
	        return val;
	    };
	
	    /**
	     * Returns an unsigned two-byte number from the buffer at the specified index.
	     *
	     * 
	     * @return  the unsigned two-byte number
	     * @public
	     * @function
	     * @name getUnsignedShortAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedShortAt = function(index) {
	    	_checkForReadAt(this,index,2);
	        var array = this.array;
	        return this.order._toUnsignedShort(array[index++], array[index++]);
	    }
	
	    /**
	     * Returns an unsigned three-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the unsigned three-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsignedMediumInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedMediumInt = function() {
	        var array = this.array;
	        return this.order._toUnsignedMediumInt(array[this.position++], array[this.position++], array[this.position++]);
	    };
	
	    /**
	     * Returns a three-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the three-byte number
	     *
	     * @public
	     * @function
	     * @name getMediumInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getMediumInt = function() {
	        var val = this.getMediumIntAt(this.position);
	        this.position += 3;
	        return val;
	    };
	
	    /**
	     * Returns a three-byte number from the buffer at the specified index.
	     *
	     * @param i     {Number} the index
	     *
	     * @return {Number}  the three-byte number
	     *
	     * @public
	     * @function
	     * @name getMediumIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getMediumIntAt = function(i) {
	        var array = this.array;
	        return this.order._toMediumInt(array[i++], array[i++], array[i++]);
	    };
	
	    /**
	     * Returns a four-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the four-byte number
	     *
	     * @public
	     * @function
	     * @name getInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getInt = function() {
	    	_checkForRead(this,4);
	        var val = this.getIntAt(this.position);
	        this.position += 4;
	        return val;
	    };
	    
	    /**
	     * Returns a four-byte number from the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     *
	     * @return {Number}  the four-byte number
	     *
	     * @public
	     * @function
	     * @name getIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getIntAt = function(index) {
	    	_checkForReadAt(this,index,4);
	        var array = this.array;
	        return this.order._toInt(array[index++], array[index++], array[index++], array[index++]);
	    };
	
	    /**
	     * Returns an unsigned four-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the unsigned four-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsignedInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedInt = function() {
	    	_checkForRead(this,4);
	        var val = this.getUnsignedIntAt(this.position);
	        this.position += 4;
	        return val;
	    };
	
	    /**
	     * Returns an unsigned four-byte number from the buffer at the specified position.
	     * 
	     * @param index the index
	     * 
	     * @return {Number}  the unsigned four-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsignedIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedIntAt = function(index) {
	    	_checkForReadAt(this,index,4);
	        var array = this.array;
	        return this.order._toUnsignedInt(array[index++], array[index++], array[index++], array[index++]);
	        return val;
	    };
	
	    /**
	     * Returns a length-prefixed string from the buffer at the current position.
	     *
	     * @param  fieldSize {Number}   the width in bytes of the prefixed length field
	     * @param  cs        {Charset}  the character set
	     *
	     * @return {String}  the length-prefixed string
	     *
	     * @public
	     * @function
	     * @name getPrefixedString
	     * @memberOf ByteBuffer
	     */
	    $prototype.getPrefixedString = function(fieldSize, cs) {
	      var len = 0;
	      switch (fieldSize || 2) {
	        case 1:
	          len = this.getUnsigned();
	          break;
	        case 2:
	          len = this.getUnsignedShort();
	          break;
	        case 4:
	          len = this.getInt();
	          break;
	      }
	      
	      if (len === 0) {
	        return "";
	      }
	      
	      var oldLimit = this.limit;
	      try {
	          this.limit = this.position + len;
	          return cs.decode(this);
	      }
	      finally {
	          this.limit = oldLimit;
	      }
	    };
	    
	    /**
	     * Returns a string from the buffer at the current position. 
	     * 
	     * @param  cs  {Charset}  the character set
	     *
	     * @return {String}  the string
	     *
	     * @public
	     * @function
	     * @name getString
	     * @memberOf ByteBuffer
	     */
	    $prototype.getString = function(cs) {
	      try {
	          return cs.decode(this);
	      }
	      finally {
	          this.position = this.limit;
	      }
	    };
	    
	    /**
	     * Returns a sliced buffer, setting the position to zero, and 
	     * decrementing the limit accordingly.
	     *
	     * @return  {ByteBuffer} the sliced buffer
	     *
	     * @public
	     * @function
	     * @name slice
	     * @memberOf ByteBuffer
	     */
	    $prototype.slice = function() {
	      return new ByteBuffer(this.array.slice(this.position, this.limit));
	    };
	
	    /**
	     * Flips the buffer. The limit is set to the current position,
	     * the position is set to zero, and the mark is reset.
	     *
	     * @return  {ByteBuffer} the flipped buffer
	     *
	     * @public
	     * @function
	     * @name flip
	     * @memberOf ByteBuffer
	     */    
	    $prototype.flip = function() {
	       this.limit = this.position;
	       this.position = 0;
	       this._mark = -1;
	       return this;
	    };
	    
	    /**
	     * Rewinds the buffer. The position is set to zero and the mark is reset.
	     *
	     * @return  {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name rewind
	     * @memberOf ByteBuffer
	     */    
	    $prototype.rewind = function() {
	       this.position = 0;
	       this._mark = -1;
	       return this;
	    };
	    
	    /**
	     * Clears the buffer. The position is set to zero, the limit is set to the
	     * capacity and the mark is reset.
	     *
	     * @return  {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name clear
	     * @memberOf ByteBuffer
	     */    
	    $prototype.clear = function() {
	       this.position = 0;
	       this.limit = this.capacity;
	       this._mark = -1;
	       return this;
	    };
	    
	    /**
	     * Returns the number of bytes remaining from the current position to the limit.
	     *
	     * @return {Number} the number of bytes remaining
	     *
	     * @public
	     * @function
	     * @name remaining
	     * @memberOf ByteBuffer
	     */
	    $prototype.remaining = function() {
	      return (this.limit - this.position);
	    };
	    
	    /**
	     * Returns true   if this buffer has remaining bytes, 
	     *         false  otherwise.
	     *
	     * @return  {Boolean} whether this buffer has remaining bytes
	     *
	     * @public
	     * @function
	     * @name hasRemaining
	     * @memberOf ByteBuffer
	     */
	    $prototype.hasRemaining = function() {
	      return (this.limit > this.position);
	    };
	
	    /**
	     * Skips the specified number of bytes from the current position.
	     * 
	     * @param  size  {Number}  the number of bytes to skip
	     *
	     * @return  {ByteBuffer}  the buffer
	     *
	     * @public
	     * @function
	     * @name skip
	     * @memberOf ByteBuffer
	     */    
	    $prototype.skip = function(size) {
	      this.position += size;
	      return this;
	    };
	    
	    /**
	     * Returns a hex dump of this buffer.
	     *
	     * @return  {String}  the hex dump
	     *
	     * @public
	     * @function
	     * @name getHexDump
	     * @memberOf ByteBuffer
	     */    
	    $prototype.getHexDump = function() {
	       var array = this.array;
	       var pos = this.position;
	       var limit = this.limit;
	
	       if (pos == limit) {
	         return "empty";
	       }
	       
	       var hexDump = [];
	       for (var i=pos; i < limit; i++) {
	         var hex = (array[i] || 0).toString(16);
	         if (hex.length == 1) {
	             hex = "0" + hex;
	         }
	         hexDump.push(hex);
	       }
	       return hexDump.join(" ");
	    };
	    
	    /**
	     * Returns the string representation of this buffer.
	     *
	     * @return  {String}  the string representation
	     *
	     * @public
	     * @function
	     * @name toString
	     * @memberOf ByteBuffer
	     */    
	    $prototype.toString = $prototype.getHexDump;
	
	    /**
	     * Expands the buffer to support the expected number of remaining bytes
	     * after the current position.
	     *
	     * @param  expectedRemaining  {Number}  the expected number of remaining bytes
	     *
	     * @return {ByteBuffer}  the buffer
	     *
	     * @public
	     * @function
	     * @name expand
	     * @memberOf ByteBuffer
	     */
	    $prototype.expand = function(expectedRemaining) {
	      return this.expandAt(this.position, expectedRemaining);
	    };
	    
	    /**
	     * Expands the buffer to support the expected number of remaining bytes
	     * at the specified index.
	     *
	     * @param  i                  {Number} the index
	     * @param  expectedRemaining  {Number}  the expected number of remaining bytes
	     *
	     * @return {ByteBuffer}  the buffer
	     *
	     * @public
	     * @function
	     * @name expandAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.expandAt = function(i, expectedRemaining) {
	      var end = i + expectedRemaining;
	
	      if (end > this.capacity) {
	        this.capacity = end;
	      }
	      
	      if (end > this.limit) {
	        this.limit = end;
	      }
	      return this;
	    };
	    
	    function _autoExpand($this, expectedRemaining) {
	      if ($this.autoExpand) {
	        $this.expand(expectedRemaining);
	      }
	      return $this;
	    }
	
	    function _checkForRead($this, expected) {
	      var end = $this.position + expected;
	      if (end > $this.limit) {
	        throw new Error("Buffer underflow");
	      }
	      return $this;
	    }
	
	    function _checkForReadAt($this, index, expected) {
	      var end = index + expected;
	      if (index < 0 || end > $this.limit) {
	        throw new Error("Index out of bounds");
	      }
	      return $this;
	    }
	    
	    function _checkForWriteAt($this, index, expected) {
	      var end = index + expected;
	      if (index < 0 || end > $this.limit) {
	        throw new Error("Index out of bounds");
	      }
	      return $this;
	    }
	    
	    $module.ByteBuffer = ByteBuffer;        
    }
   
})(Kaazing);
