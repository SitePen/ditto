$(function(){
	
	var dropbox = $('#dropbox');
	var message = $('.message', dropbox);
	
	dropbox.filedrop({
		paramname 	:'pic',
		maxfiles 	: 10,
    	maxfilesize : 20,
		url 		: 'post_file.php',
		
    	error: function(err, file) {
			switch(err) {
				case 'BrowserNotSupported':
					showMessage("You're browser doesn't support HTML5 uploads. Upgrade!");
					break;
				case 'TooManyFiles':
					showMessage('Try uploading '+this.maxfiles+' files or less.');
					break;
				case 'FileTooLarge':
					showMessage(file.name+' is too big. Try to keep projects under 20mb each.');
					break;
				default:
					showMessage('Uh oh. Something went horribly wrong...');
					break;
			}
		},

		beforeEach: function(file){
			if(file.type != "application/zip" && file.type != "application/x-zip-compressed"){
				showMessage("Only .zips are allowed!");
				return false;
			}
			return true;
		
		},

		uploadStarted:function(i, file, len){
			$("#dropbox").hide();
			var template = "<div class='result loading' id='result-"+i+"'>"+
								'<div id="outer-barG-'+i+'" class="outer-barG">'+
									'<div id="front-barG" class="bar-animationG">'+
										'<div id="barG_1" class="bar-lineG"></div>'+
										'<div id="barG_2" class="bar-lineG"></div>'+
										'<div id="barG_3" class="bar-lineG"></div>'+
									'</div>'+
								'</div>'+
								'<div class="resultOuter" id="resultContainer-'+i+'">'+
									'<div class="titleOuter">'+
										'<div class="titleInner" id="resultContent-'+i+'">'+
											'<div class="numberCircle">'+(i+1)+'</div>'+
											'<div class="resultTitle">'+file.name+'</div>'+
										'</div>'+
									'</div>'+
									'<div id="resultLower-'+i+'" class="resultLower"></div>'+
								'</div>'+
							'</div>';
			$("#results").append(template);
			$("#results").css("display", "inline-block");
		},
		
		uploadFinished:function(i,file,response){
			$("#outer-barG-"+i).remove();
			$("#resultContainer-"+i).show();
			response.deps.sort();
			for(var j=0; j<response.deps.length; j++){
				$("#resultLower-"+i).append("<div class='resultRow-"+((j%2==0)?"odd":"even")+"'>"+response.deps[j]+((j==response.deps.length-1)?"":",")+"</div>");
			}
			$("#result-"+i).removeClass("loading");
		}
	});

	function showMessage(msg){
		message.html(msg);
		message.css("color", "red");
	}

});