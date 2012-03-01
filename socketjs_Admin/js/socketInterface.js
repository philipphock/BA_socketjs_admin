var PORT = 8081;
var user = "admin";
var password = "admin";

function SocketInterface(){}

SocketInterface.connect = function(){
	UiControl.showMessageDialog("waiting for connection...","connecting",true);
	/*
	UiControl.connectiontimer=setTimeout(function(){
		UiControl.showMessageDialog("no connection to proxyserver","connecting",true);
	},3000);
	*/
	try{
		SocketInterface.proxy = new Proxy();
		SocketInterface.proxy.init("localhost:"+PORT);
		
	}catch(exception){
		UiControl.showMessageDialog("Error establishing websocket connection.\nYour browser does not support websockets.","error",true,10);
		
	}
}
SocketInterface.proxy;
$(document).ready(function(){
	SocketInterface.connect();
	
});



function TCPBridge(){
	var self = this;
	self.socket;
	
	self.onmessage=function(e){
		console.log("this should not be called");
	}
	
	self.init=function(url){
		
		self.socket=Socket.createTCPSocket(url,{hostkey:"397b93a18f7604f22e4be33fa73769bdaea4d00cdc61b3c2b07274b23ae18649a12730caab20f4a60c7e8c8ea7517981dc15c926e79f8785180a8c88a1f6d66a34b099ab"});
		
		self.socket.onerror = function(err){
			alert(err);
		}
		
		self.socket.onclose= function(close){
			UiControl.showMessageDialog("no connection to host","error",true);
		}
		
		self.socket.onmessage=function(e){
			console.log("incoming:",e.text);
			self.onmessage(e); 
		}
		
		self.socket.onopen=function(msg){
			
			//clearTimeout(UiControl.connectiontimer);
			//UiControl.hideMessageDialog();
			//UiControl.showLoginDialog();
			SocketInterface.proxy.login(user,password);
		}
	}
	
	self.send = function(msg){
		if (msg == undefined || msg == null ) return;
		self.socket.doSend(msg);
		//console.log(msg);
		
	}
	
}

function SimpleMessageProtocol(){

	
	this.toClient = function(msg){
		msg = JSON.stringify(msg);
		var len = msg.length;
		
		this.send(len+":"+msg);
		
	}
	
	
}

/**
 * stub object for remote access
 * @returns
 */
function Proxy(){
	var self = this;
	
	this.login = function(user,pass){
		self.toClient({"cmd": "AUTHREQ","user": user, "password": pass});
	}
	this.getList=function(){
		self.toClient({"cmd": "list",status:"cmd"});
	}
	this.deletePolicy=function(id){
		
		self.toClient({"status":"cmd","cmd": "delete","body":id});
	}
	this.edit=function(values){
		
		if (isNaN(parseInt(values.port))){
			values.port=0;
		}
		self.toClient({"status":"cmd","cmd": "edit","body":values});
	}
	this.create=function(values){
		if (isNaN(parseInt(values.port))){
			values.port=0;
		}
		self.toClient({"status":"cmd","cmd": "new","body":values});
	}
	this.generalPoliciesUpdate=function(values){
		if (isNaN(parseInt(values.maxConnections))){
			values.maxConnections=-1;
		}
		self.toClient({"status":"cmd","cmd": "general","body":values});
	}
	
	this.generateHostkey=function(host){
		self.toClient({"status":"cmd","cmd": "genHost","body":host});
	}
	
	this.generateSrckey=function(){
		self.toClient({"status":"cmd","cmd": "genSrc"});
	}

}

SimpleMessageProtocol.prototype=new TCPBridge();
SimpleMessageProtocol.prototype.constructor=SimpleMessageProtocol;

Proxy.prototype=new SimpleMessageProtocol();
Proxy.prototype.constructor=Proxy;



// simple message protocol

/**
 * demux head and body
 */
SimpleMessageProtocol.prototype.onmessage = function(msg){

	if (msg == undefined) msg = "";
	var header;
	var body;
	if (this.msg == undefined) this.msg="";
	this.msg += msg.text;
	
	if (this.msg.length == 0 ) return;
		//console.log("self.msg:",this.msg);
	var headerSeparator=this.msg.indexOf(":");
		//console.log("separator at:",headerSeparator);
	if (headerSeparator > -1){
		//header send
			//console.log("header send:");
		header = this.msg.substr(0,headerSeparator);
		body = this.msg.substr(headerSeparator+1);
			//console.log(" head:",header);
			//console.log(" body:",body);
		
			//console.log(parseInt(header));
		if (body.length >= parseInt(header)){
			
			//msg completely send
				//console.log(" msg complete:");
			var bodyCur=body.substr(0,header);
				//console.log("  current body:",bodyCur);
			this.msg = body.substr(header);
				//console.log("  other msgs:",this.msg);
				//console.log(this,bodyCur);
			this.aMessage(bodyCur);
			
			if (this.msg == "undefined") return;
			if (this.msg != undefined && this.msg.length>0){
				//process other messages
					//console.log("  make recursive call :)",this.msg);
				
				this.onmessage("");
			}
		}
	}else{
		//header not complete, check if header correct:
		if (isNaN(parseInt(this.msg))){
			//UiControl.showMessageDialog("the server sent a wrong protocol","error",false,20);
			this.msg="";
		}
	}
	
	
}


//Proxy

SimpleMessageProtocol.prototype.aMessage = function(msg){
	
	var json = JSON.parse(msg);
	
	if (json.status == "AUTHREJECT"){
		
		UiControl.wrongLogins++;
		console.log(UiControl.wrongLogins);
		if(UiControl.wrongLogins>=3){
			UiControl.showMessageDialog("Too many wrong login attempts","Too many logins",true,100);
			return;
		}
		UiControl.showLoginDialog("Username and password don't match.<br>Try again.");
		return;
	}
	if (json.status == "ERROR"){
		UiControl.showMessageDialog(json.body, "error");
		return;
	}
	if (json.status == "LOGINOK"){
		//UiControl.showMessageDialog("login successful","login");
		SocketInterface.proxy.getList();
		//DEBUG:
		UiControl.hideMessageDialog();
		return;
	}
	if (json.status == "OK"){
		//UiControl.showMessageDialog("operation successful","successful")
		//return;
	}
	
	if (json.cmd == "list"){
		//list
		
		Model.specific.setData(json.body.specific);
		Model.general.setData(json.body.general);
		return;
	}
	
	if (json.cmd == "hostkey"){
		$("#key_host").html(json.body);
		return;
	}
	if (json.cmd == "srckey"){
		$("#key_src").html(json.body);
		return;
	}
	
}

