define([
	"dojo/_base/declare",
	"dojo/has", 
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom-style",
	"dojo/dom-class",
	"dijit/form/CheckBox",
	"dojo/parser",
	"dojo/dom-construct",
	"dojo/text!./resources/Result.html",
	"dojo/query",
	"dojox/dtl",
	"dojox/dtl/Context",
	"dojo/fx",
	"dojo/dom-geometry",
	"dijit/form/TextBox",
	"dijit/form/RadioButton",
	"dojo/_base/sniff"
], function(declare, has, lang, on, style, domClass, CheckBox, parser, dom, resultTemplate, query, dtl, Context, coreFx, domGeom){
	return declare("Ditto",[],{
		_drawerOpen : false,

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
			parser.parse();
		},

		refresh: function(){
			// Show the drop box again
			style.set(query("#dropbox")[0], "display", "block");
			// Clear out old results
			query("#results")[0].innerHTML = "";
			// Hide the refresh button
			style.set(query(".refresh")[0], "display", "none");
		},

		showMessage: function(msg){
			// Grab a handle to the message div
			var message = query('.message')[0];
			// Blast in msg
			message.innerHTML = msg;
			// Color it red now
			style.set(query(".message")[0], "color", "red");
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
			style.set(query("#dropbox")[0], "display", "none");
			// Show the refresh button
			style.set(query(".refresh")[0], "display", "inline");
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
			style.set(query("#results")[0], "display", "inline-block");
		},

		onUploadDone: function(i,file,response){
			// Kill the loading indicator
			dom.destroy(query("#outer-barG-"+i)[0]);
			// Show the result 
			style.set(query("#resultContainer-"+i)[0], "display", "block");
			// Sort the dependency array alphabetically
			response.deps.sort();
			// 
			for(var j=0; j<response.deps.length; j++){
				query("#resultLower-"+i)[0].innerHTML += 
					"<div class='resultRow-"+((j%2==0)?"odd":"even")+"'>"
					+response.deps[j]+((j==response.deps.length-1)?"":",")+"</div>";
			}
			domClass.remove(query("#result-"+i)[0], "loading");
		},

		toggleDrawer: function(){
			if(this._drawerOpen){
				this.hideDrawer();
			}else{
				this.showDrawer();
			}
		},

		hideDrawer: function(){
			if(this._drawerOpen){
				var amt = 300;
				this._animateDrawer(amt, this._drawerOpen);
				this._drawerOpen = false;
			}
		},

		showDrawer: function(){
			if(!this._drawerOpen){
				var amt = -300;
				this._animateDrawer(amt, this._drawerOpen);
				this._drawerOpen = true;
			}
		},

		_animateDrawer: function(amt, open){
			var t = domGeom.getMarginBox("drawer").t;
			var l = domGeom.getMarginBox("drawer").l;
			style.set("drawer", "top", t+"px");
			style.set("drawer", "left", l+"px");
			coreFx.slideTo({
				node: "drawer",
				top: t.toString(),
				left: (l + amt).toString(),
				unit: "px",
				onEnd: lang.hitch(this, function(){
					style.set("drawer", "top", "50%");
					style.set("drawer", "left", "auto");
					if(open){
						style.set("drawer", "right", "-310px");
					}else{
						style.set("drawer", "right", "0");
					}
				})
			}).play();
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
				url 			: 'app/resources/post_file.php',
		    	error 			: errFunc,
				beforeEach 		: beforeFunc,
				uploadStarted 	: beginFunc,
				uploadFinished 	: doneFunc
			});
		},

		_connectStuff: function(){
			query(".refresh").on("click", this.refresh);
			query(".handle").on("click", lang.hitch(this, "toggleDrawer"));
		},

		_checkBrowser: function(){
			if(has("webkit")<536 || has("ff")<16){
				dom.destroy(query("#wrapper")[0]);
				style.on(query(".alert")[0], "display", "block");
				return false;
			}
			return true;
		}
	});
});