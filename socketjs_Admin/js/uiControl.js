function UiControl(){}
UiControl.connectiontimer;
UiControl.wrongLogins = 0;

UiControl.createSocketCheckbox = function(name,str){
	if (str == undefined) str = "";
	var sel1 = "";
	var sel2 = "";
	var sel3 = "";
	
	if (str.match("TCP"))
		sel1 = "checked='checked'";
	if (str.match("UDP"))
		sel2 = "checked='checked'";
	if (str.match("UNIX"))
		sel3 = "checked='checked'";

	
	var ret = "<input type='checkbox' name='" + name + "' value='tcp' " + sel1 + "/>TCP" 
			+ "<input type='checkbox' name='" + name + "' value='udp' " + sel2 + "/>UDP"					
			+ "<input type='checkbox' name='" + name + "' value='unix' " + sel3 + "/>UNIX<br>";
	return ret;
}

UiControl.createDecision = function(name,str,ask){
	if (str == undefined) str="";
	
	var allow_sel = "";
	var deny_sel = "";
	var ask_sel = "";
	
	if (str.match("ask"))
		ask_sel = "selected='selected'";
	else if (str.match("allow"))
		allow_sel = "selected='selected'";
	else if (str.match("deny"))
		deny_sel = "selected='selected'";
	
	
	if (ask == undefined ) ask = true;
	if (ask_sel) ask = true;
	var ask_t = "";
	if (ask){
		ask_t = "  <option label='ask' "+ ask_sel +">ask</option>";
	}
	
	return   "<select name='" + name + "' size='1'>"
           + "  <option label='allow' "+ allow_sel +">allow</option>"
           + "  <option label='deny'  "+ deny_sel +">deny</option >"
           + ask_t
           +"</select>";
}

UiControl.hideMessageDialog=function(){
	$("#msgdialog").hide();
	$("#msgdialogBlack").hide();
}
UiControl.showMessageDialog=function(msg, head,hideOK,priority){
	if (hideOK == undefined){
		hideOK = false;
	}
	if (priority == undefined){
		priority = 0;
	}
	var btn ="";
	if (!hideOK){
		btn="class='hidden'";
	}
	
	var dialog = "<div id='msgdialogBlack' >&nbsp;</div> " 
			   + "<div id='msgdialog' > "
			   + "<h1></h1>"
			   + "<input type = 'hidden' value='' />"
			   + "<div id='msgdialogContent'>"
			   + "<p id='msgdialogMsg'></p>"
			   + "<button>ok</button>" 
			   + "</div>";
			   + "</div>";
	
			   
	if ($("#msgdialog").length<=0){
		$("body").append(dialog);
		$("#msgdialog").hide();
		$("#msgdialog button").click(function(){
			$("#msgdialog").hide();
			$("#msgdialogBlack").hide();
		});
	}else{
		var prty = $("#msgdialog input[type=hidden]").val();
		if (prty > priority){
			return;
		} 
	}
	$("#msgdialog h1").text(head);
	$("#msgdialog #msgdialogMsg").text(msg);
	
	
	$("#msgdialog input[type=hidden]").val(priority);
	if (!hideOK){
		$("#msgdialog button").show();
	}else{
		$("#msgdialog button").hide();
	}
	
	$("#msgdialogBlack").show();
	$("#msgdialog").fadeIn("slow",function(){
		$("#msgdialog button").focus();
		setTimeout(function(){
			$("#msgdialog button").focus();
		},100);
		$("#msgdialog button").focus();
	});	
}
UiControl.showLoginDialog=function(message){
	var msg = "";
	if (message != undefined){
		msg="<p id='dialogMsg'>" + message + "</p>";
	}
	var dialog = "<div id='dialogBlack' >&nbsp;</div> " 
			   + "<div id='dialog' > "
			   + "<h1>Login</h1>"
			   + "<div id='dialogContent'>"
			   + msg
			   + "<label for='user'>Username</label>" 
			   + "<input type='text' value='' name='user'/> " 
			   + "<label for='password'>Password</label>" 
			   + "<input type='password' value='' name='password' /> "
			   + "<button id='loginok'>login</button>" 
			   + "</div>";
			   + "</div>";
	
	$("#dialog").remove();
	$("#dialogBlack").remove();
	$("body").append(dialog);
	$("#dialog").hide();
	$("#dialog button").click(function(){
		SocketInterface.proxy.login($("#dialog input[name=user]").val(),$("#dialog input[name=password]").val());
		$("#dialog").remove();
		$("#dialogBlack").remove();
	})
	$("#dialog").fadeIn("slow");
} 