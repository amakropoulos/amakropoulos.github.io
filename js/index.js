$(document).ready(function(){

 var w = window.innerWidth;
 var displaybrain = true;
 if (w<767){
  displaybrain = false;
 } else {

    var WEBGL_ENABLED = false;
    var canvas = document.createElement("canvas");
    var gl = null;

    CANVAS_ENABLED = !!canvas;
    WEB_WORKERS_ENABLED = !!window.Worker;

    try {
      if(canvas && window.WebGLRenderingContext) {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      }
      WEBGL_ENABLED = !!gl;
    } catch(e) {
      WEBGL_ENABLED = false;
    }

    if(!WEBGL_ENABLED){
      displaybrain = false;
    }
  }

  bb=document.getElementById("brainbrowser")
  uib=document.getElementsByClassName("bioright")
  if(!displaybrain){
      bb.style.display="none"; 
      bb.src=''
      for(var i=0; i<uib.length; i++){
        uib[i].style.display="none";  
      }
    }else{
      if(bb.style.display=="none"){
        bb.src="brainbrowser/surface-viewer.html"; 
        bb.style.display="inline"; 
        for(var i=0; i<uib.length; i++){
          uib[i].style.display="inline";  
        }
      }
    }
  

    var tab_id = $.cookie('tab_id');

    var reloadIFrame=false;											
    if(!tab_id) tab_id="tab-1";
    if(tab_id!="tab-1") reloadIFrame=true;
	
	$('ul#tabs li').removeClass('current');
	$('.tab-content').removeClass('current');
	$("#"+tab_id).addClass('current');
	$("#link-"+tab_id).addClass('current');

	$('ul#tabs li').click(function(){
		var tab_id = $(this).attr('data-tab');
		$('ul#tabs li').removeClass('current');
		$('.tab-content').removeClass('current');

		$(this).addClass('current');
		$("#"+tab_id).addClass('current');	
		if(tab_id=="tab-1" && reloadIFrame && displaybrain){
			document.getElementById("brainbrowser").src="brainbrowser/surface-viewer.html";	
			reloadIFrame=false;
		}
       		$.cookie('tab_id', tab_id);
	})


});

$(document).ready(function(){
	$().UItoTop({ easingType: 'easeOutQuart' });
	$('#stuck_container').tmStickUp({});
});


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-99005688-1', 'auto');
ga('send', 'pageview');

