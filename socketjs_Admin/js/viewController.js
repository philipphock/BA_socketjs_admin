
function View(){}

View.pages = {"general":Model.general,"specific":Model.specific,"about":Model.about,"auth":Model.auth};

View.pageRenderers = {"general":new GeneralPageRenderer(),"specific":new SpecificPageRenderer(),"about":new AboutPageRenderer(),"auth":new AuthPageRenderer()};
View.currentPageId;

View.setPage=function(page){
	View.currentPageId=page;
	var ren = View.pageRenderers[page];
	if (ren == undefined){
		ret = new DefaultPageRenderer();
	}
	var pg = View.pages[page];
	if (ren != undefined && pg != undefined){
		ren.render(pg);
		ren.controls();
	}
		
		
}

View.update=function(id){
	
	if (this.currentPageId != id) return;
	
	View.setPage(id);
}

//connecting MVC with observer pattern:
Model.specific.addDataModelListener(View);
Model.general.addDataModelListener(View);


$(document).ready(function(){
	
	$(".pagelink").click(function(e){
		e.preventDefault();
		var link = $(this).attr("href");
		View.setPage(link);
		$(".pagelink").removeClass("active");
		$(this).addClass("active");
	});
	
	View.setPage("general");
	
});


