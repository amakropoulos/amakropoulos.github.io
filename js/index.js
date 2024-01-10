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

$(document).ready(function(){
  // google analytics
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-211ENWEWPL');
});