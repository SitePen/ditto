define([
	"dojo/_base/declare",
	"dojo/has", 
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom-construct",
	"dojo/text!/ditto/html/Result.html",
	"dojo/query",
	"dojox/dtl",
	"dojox/dtl/Context",
	"dojo/_base/sniff"
], function(declare, has, lang, on, dom, resultTemplate, query, dtl, Context){
	return declare("Ditto",[],{
		constructor: function(){
			// Check browser version before we do anything
			var ok = this._checkBrowser();
			// If all is OK, continue on
			if(ok){
				// Set up connections
				this._connectStuff();
				// Create uploader
				this._createUploader();
			}
		},

		refresh: function(){
			// Show the drop box again
			query("#dropbox").style({display:"block"});
			// Clear out old results
			query("#results")[0].innerHTML = "";
			// Hide the refresh button
			query(".refresh").style({display:"none"});
		},

		showMessage: function(msg){
			// Grab a handle to the message div
			var message = query('.message')[0];
			// Blast in msg
			message.innerHTML = msg;
			// Color it red now
			query('.message').style({color:"red"});
		},

		onUploadError: function(err, file) {
			// Handle errors
			switch(err) {
				case 'BrowserNotSupported':
					this.showMessage("You're browser doesn't support HTML5 uploads. Upgrade!");
					break;
				case 'TooManyFiles':
					this.showMessage('Try uploading 10 files or less.');
					break;
				case 'FileTooLarge':
					this.showMessage(file.name+' is too big. Try to keep projects under 20mb each.');
					break;
				default:
					this.showMessage('Uh oh. Something went horribly wrong...');
					break;
			}
		},

		onUploadBefore: function(file){
			// Make sure we are dealing with a .zip
			if(file.type!="application/zip" && file.type!="application/x-zip-compressed"){
				this.showMessage("Only .zips are allowed!");
				return false;
			}
			return true;
		},

		onUploadBegin: function(i, file, len){
			// Hide the drop box
			query("#dropbox").style({display:"none"});
			// Show the refresh button
			query(".refresh").style({display:"inline"});
			// Render template
			var template = new dojox.dtl.Template(resultTemplate);
			var context = new dojox.dtl.Context({
			  index: i,
			  number: i+1,
			  filename: file.name
			});
			// Add to results section
			query("#results")[0].innerHTML += template.render(context);
			// Show that stuff to the world!
			query("#results").style({display: "inline-block"});
		},

		onUploadDone: function(i,file,response){
			// Kill the loading indicator
			dom.destroy(query("#outer-barG-"+i)[0]);
			// Show the result 
			query("#resultContainer-"+i).style({display: "block"});
			// Sort the dependency array alphabetically
			response.deps.sort();
			// 
			for(var j=0; j<response.deps.length; j++){
				query("#resultLower-"+i)[0].innerHTML += 
					"<div class='resultRow-"+((j%2==0)?"odd":"even")+"'>"
					+response.deps[j]+((j==response.deps.length-1)?"":",")+"</div>";
			}
			query("#result-"+i).removeClass("loading");
		},

		_createUploader: function(){
			// Callbacks bc j(ust)Query's scoping is weird
			var errFunc = lang.hitch(this, "onUploadError");
			var beforeFunc = lang.hitch(this, "onUploadBefore");
			var beginFunc = lang.hitch(this, "onUploadBegin");
			var doneFunc = lang.hitch(this, "onUploadDone");
			// TODO Convert this jQuery plugin to pure Dojo
			$('#dropbox').filedrop({
				paramname 		: 'pic',
				maxfiles 		: 10,
		    	maxfilesize 	: 20,
				url 			: 'post_file.php',
		    	error 			: errFunc,
				beforeEach 		: beforeFunc,
				uploadStarted 	: beginFunc,
				uploadFinished 	: doneFunc
			});
		},

		_connectStuff: function(){
			query(".refresh").on("click", this.refresh);
		},

		_checkBrowser: function(){
			if(has("webkit")<536 || has("ff")<16){
				dom.destroy(query("#wrapper")[0]);
				query(".alert").style({display:"block"});
				return false;
			}
			return true;
		}
	});
});