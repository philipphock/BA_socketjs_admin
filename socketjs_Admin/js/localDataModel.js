function Model(){}
Model.specific = new Page("Specific Policies","specific");
Model.general = new Page("General Policies","general");
Model.about = new Page("About","about");
Model.auth = new Page("Authentication","auth");

function Page(title,id){
	var self=this;
	this.id=id;
	this.title=title;
	this.data="";
	this.dataModelListener=[];
	this.setData=function(data){
		this.data=data;
		$(this.dataModelListener).each(function(k,v){
			v.update(self.id);	
		});
		
	}
	this.getData=function(){
		return this.data;
	}
	
	this.addDataModelListener=function(l){
		this.dataModelListener.push(l);
	}
}





Model.about.data = "<p>created by Philipp Hock</p>";

Model.auth.data = "<table id='authtbl'><tr> <th>Hostkey</th> <th>Sourcekey</th> </tr>"
	
	
				+ "<tr>"
				+  "<td><label for='host'>Host:</label></td>"
				+  "<td></td>"
				+ "</tr>"
				
				+ "<tr>" 
				+  "<td><input type='text' name='host'/></td>" 
				+  "<td></td>"
				+ "</tr>"  
				
				+ "<tr>"
				+  "<td><button id='genHost'>generate Hostkey</button></td>"
				+  "<td><button id='genSrc'>generate Sourcekey</button></td>"
				+ "</tr>"

				+ "<tr>"
				+  "<td><label>Hostkey:</label></td>"
				+  "<td><label>Sourcekey:</label></td>"
				+ "</tr>"
				
				+ "<tr>"
				+  "<td><textarea id='key_host'></textarea></td>"
				+  "<td><textarea id='key_src'></textarea></td>"
				+ "</tr>"