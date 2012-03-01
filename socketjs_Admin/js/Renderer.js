function DefaultPageRenderer(){

	this.render=function(page){
		$("#heading").text("");
		$("#content").text("");
		$("#heading").html(this.getTitle(page));
		$("#content").html(this.getContent(page));
	}
	this.getTitle=function(page){
		return page.title;
	}
	this.getContent=function(page){
		return page.getData();
	}
	this.controls=function(page){
		
	}
}

function GeneralPageRenderer(){}
GeneralPageRenderer.prototype = new DefaultPageRenderer();
GeneralPageRenderer.prototype.constructor = GeneralPageRenderer;


  
GeneralPageRenderer.prototype.getContent=function(page){
	
	return  "<form>"
		    + "<label for='enabledSockets'>Allowed Sockets: </label>"
			+ UiControl.createSocketCheckbox("enabledSockets",page.getData().enabledSockets)
			+ "<label for='unknownPolicyRule'>Unknown Connection: </label>"
			+ UiControl.createDecision("unknownPolicyRule",page.getData().unknownPolicyRule)
			+ "<br><label for='localSource'>Local Source: </label>"
			+ UiControl.createDecision("localSource",page.getData().localSource)
			+ "<br><label for='trustedDest'>Trusted Destination: </label>"
			+ UiControl.createDecision("trustedDest",page.getData().trustedDest)
			+ "<br><label for='trustedSource'>Trusted Source: </label>"
			+ UiControl.createDecision("trustedSource",page.getData().trustedSource)
			+ "<br><label for='maxConnections'>Max. Connections: </label>"
			+ "<input type = 'number' name= 'maxConnections' value = '"+page.getData().maxConnections+"' />"
			+ "<br><br><input type = 'submit' value = 'ok' />"
			+ "</form>"; 
	

}
GeneralPageRenderer.prototype.controls=function(page){
	$("input[type=submit]").click(function(e){
		e.preventDefault();
		var enabledSockets=[];
		$("input[type=checkbox][name=enabledSockets]:checked").each(function(){
			enabledSockets.push($(this).val());
		});
		var unknownPolicyRule = $("select[name=unknownPolicyRule]").val();
		var localSource = $("select[name=localSource]").val();
		var trustedDest = $("select[name=trustedDest]").val();
		var trustedSource = $("select[name=trustedSource]").val();
		var maxConnections = $("input[name=maxConnections]").val();
		
		SocketInterface.proxy.generalPoliciesUpdate({"enabledSockets":enabledSockets,"unknownPolicyRule":unknownPolicyRule,"localSource":localSource,"trustedDest":trustedDest,"trustedSource":trustedSource,"maxConnections":maxConnections});
	});
	
}




function SpecificPageRenderer(){}
SpecificPageRenderer.prototype = new DefaultPageRenderer();
SpecificPageRenderer.prototype.constructor = SpecificPageRenderer;

SpecificPageRenderer.prototype.getContent=function(page){
	var data = page.getData();
	var ret = "<form id='editnew'>"
			+ "<input type='hidden' name='id' value='' />"
			+  "<h2>New</h2>"
			+  "<label for='action'>Action:</label>"
			+  UiControl.createDecision("action", "deny")
			+  "<br><label for='type'>Type:</label>"
			+  UiControl.createSocketCheckbox("type", "")
			+  "<br><label>Source:</label>"
			+  "<input type='text' name='src' />"
			+  "<br><label>Destination:</label>"
			+  "<input type='text' name='dest' />"
			+  "<br><label>Port:</label>"
			+  "<input type='number' name='port' value='80' />"
			+  "<br><br><input type='submit' id='editnew_ok' name='editnew_new' value='ok'/>"
			+  "<input type='submit' id='editnew_abort' name='editnew_abort' value='abort'/>"
			+ "</form>"
			+ "<div id='specs'><button id = 'spec_new'>new</button><br><table><tr> <th>action</th> <th>type</th> <th>src</th> <th>dest.</th> <th>port</th> <th>ctrl</th></tr>";
			
	for (var i in data){
		ret += "<tr>" 
			+  "<td>" + data[i].action + "</td>"
			+  "<td>" + data[i].type + "</td>"
		    +  "<td>" + data[i].src + "</td>"
		    +  "<td>" + data[i].dest + "</td>"
			+  "<td>" + data[i].port + "</td>"  
			
			+  "<td>" + "<a href = '"+i+"' class = 'spec_edit' >edit</a>" + "<a href = '"+i+"' class = 'spec_del' >del</a>" + "</td>"
		
			+  "</tr>";
		
	}
	ret += "</table></div>";
	
	
	
	return ret;
}
SpecificPageRenderer.prototype.controls=function(page){
	$("#editnew").hide();
	$("#spec_new").click(function(e){
		e.preventDefault();
		$("#editnew").show();
		$("#editnew h2").text("New");
		$("#editnew_ok").attr("name","editnew_new");
	});
	$(".spec_edit").click(function(e){
		e.preventDefault();
		
	    window.scrollTo(0,0);
		var id = $(this).attr("href");
		
		var rule=Model.specific.getData()[id];
		$("select").val(rule.action);
		$('input[type=checkbox][name=type]').each(function(){
			this.checked = false;
		});
		
		$('input[type=checkbox][name=type]').each(function(){
			console.log($(this).val().toUpperCase(),rule.type);
			if (rule.type.match($(this).val().toUpperCase())){
				this.checked = true;
			} 
				
		});
		
		$("input[name=src]").val(rule.src);
		$("input[name=dest]").val(rule.dest);
		$("input[name=port]").val(rule.port);
		
		
		$("#editnew").show();
		$("#editnew h2").text("Edit");
		$("input[name=id]").val(id);
		$("#editnew_ok").attr("name","editnew_edit");
	});
	$(".spec_del").click(function(e){
		e.preventDefault();
		var id = $(this).attr("href");
		SocketInterface.proxy.deletePolicy(id);
		
	});
	$("#editnew_abort").click(function(e){
		e.preventDefault();
		$("#editnew").hide();
	});
	$("#editnew_ok").click(function(e){
		e.preventDefault();
		$("#editnew").hide();
		var action = $("select[name=action]").val();
		var type = [];
		var id = $("input[name=id]").val();
		
		$('input[type=checkbox][name=type]:checked').each(function() {
		       type.push($(this).val());
		});

		var src = $("input[name=src]").val();
		var dest = $("input[name=dest]").val();
		var port = $("input[name=port]").val();
		
		if ($("#editnew_ok").attr("name") == "editnew_edit"){
			//edit
			SocketInterface.proxy.edit({"id":id,"action":action,"type":type,"src":src,"dest":dest,"port":port});
			
		}else{
			SocketInterface.proxy.create({"action":action,"type":type,"src":src,"dest":dest,"port":port});
		}
	});
}


function AboutPageRenderer(){}
AboutPageRenderer.prototype = new DefaultPageRenderer();
AboutPageRenderer.prototype.constructor = AboutPageRenderer

function AuthPageRenderer(){}
AuthPageRenderer.prototype = new DefaultPageRenderer();
AuthPageRenderer.prototype.constructor = AuthPageRenderer

AuthPageRenderer.prototype.controls=function(page){
	
	$("#genHost").click(function(e){
		SocketInterface.proxy.generateHostkey($("input[name=host]").val());
	});
	
	$("#genSrc").click(function(e){
		SocketInterface.proxy.generateSrckey();
	});
}
