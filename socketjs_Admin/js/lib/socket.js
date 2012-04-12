/**
 * socket implementation
 * @param url
 * @param config {config.proxyPort = 8080, config.type=["TCP"|"UDP"|"UNIX"]}
 */

function Socket(url,config){

	Socket.factoryError="Use Factory method to create a Socket: createTCPSocket(), createUDPSocket() or createUNIXSocket()";
	if(url==undefined){
		throw "url parameter not specified";
	}
	
	var self = this;
	self.webSocket = null;
	
	self.url=url;
	
	if(config==undefined){
		throw Socket.factoryError;
	}else{
		self.proxyPort=config.proxyPort;
		self.type=config.type;
		self.cfg=config;
	}
	
	// WS interface \\	
	
	self.wsOnOpen = function(evt){
		self.onopen(evt);
	}
	
	self.wsOnClose = function(evt){
		self.onclose(evt);
	}
	
	self.wsOnMessage = function(evt){
		var status=evt.data.substr(0,1);
		var text=Base64.decode(evt.data.substr(1));
		
		if(self.type=="UDP"){
			//filter adress
			var headAt=text.indexOf("\n");
			var head=text.substr(0,headAt);
			var dbl=head.indexOf(":");
			var src=head.substr(0,dbl)
			var port=head.substr(dbl+1)
			var pl = text.substr(headAt+1);
			
			text={src:src,port:port,text:pl};
		}else if(self.type=="UNIX"){
			var headAt=text.indexOf("\n");
			var head=text.substr(0,headAt);
			var text=text.substr(headAt+1);
			text={src:head,text:text};
		}else{
			text={text:text};
		}
		//if(status=="I"){
		//	self.onerror(text);
		//	return;
		//}else{
		self.onmessage(text);
		//}
		
	}
	
	self.wsOnError = function(evt){
		self.onerror(evt);
	}
	
	self.wsDoSend = function(evt){
		
		evt=Base64.encode(evt)
		self.webSocket.send(evt);
	}
	
	self.verbose = function(t){
		console.log(t);
	}
	
	
	// TCP interface \\
	
	self.onopen = function(evt){
		self.verbose("not implemented: onopen"+evt)
	}
	
	self.onclose = function(evt){
		self.verbose("not implemented: onclose"+evt)
	}
	
	self.onmessage = function(evt){
		self.verbose("not implemented: onmessage"+evt)
	}
	
	self.onerror = null;
	
	self.doSend = function(evt){
		if(self.webSocket.readyState==1){
			self.wsDoSend(evt);
		}else{
			self.onerror("not connected");
		}
		
	}
	self.doClose = function(){
		self.webSocket.close();
	}
	
	self.initWebSocketProxyConnection = function(){
		
		try{
			//self.verbose("establish a "+self.type+" connection to "+self.url);
			urlEncoded=Base64.encode(self.url);
			
			var protocols=["proxy",self.type];
			if(self.cfg.hostkey!=undefined){	
				protocols.push("H"+self.cfg.hostkey);
			}
			if(self.cfg.sourcekey!=undefined){
				protocols.push("S"+self.cfg.sourcekey);
			}
			
			
			self.webSocket = new WebSocket("ws://localhost:"+self.proxyPort+"/"+urlEncoded,protocols);
			
			self.webSocket.onopen = self.wsOnOpen;
			self.webSocket.onclose = self.wsOnClose;
			self.webSocket.onmessage = self.wsOnMessage;
			self.webSocket.onerror = self.wsOnError;
		}catch(exception){
			if (self.onerror == null){
				throw exception;
			}else{
				self.onerror("failed to connect")
			}
			
			
		}
		
		
		
	}
	

	if(self.type!=undefined){
		self.initWebSocketProxyConnection();
	}

};



Socket.createSocket=function(url,type,config){
	var cfg=config;
	if(cfg==undefined){
		cfg={};
	}
	if(cfg.proxyPort==undefined){
		cfg.proxyPort=8080;
	}
	cfg.type=type;
	
	
	return new Socket(url,cfg);
	
}




Socket.createTCPSocket=function(url,config){
	
	return Socket.createSocket(url,"TCP",config);
}
Socket.createUDPSocket=function(url,config){
	var sock=Socket.createSocket(url,"UDP",config);
	return sock; 
}
Socket.createUNIXSocket=function(url,config){
	return Socket.createSocket(url,"UNIX",config);
}





/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		//input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		//output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}