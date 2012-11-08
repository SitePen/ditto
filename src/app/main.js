
define(['require' ], function (require) {
	var app = {};
	
	require([ './Ditto', 'dojo/domReady!' ], function (Ditto) {
		app.ditto = new Ditto({});
	});
});