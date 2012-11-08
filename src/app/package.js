var profile = {
	resourceTags: {
		test: function (filename, mid) {
			return false;
		},

		copyOnly: function (filename, mid) {
			return (/^app\/resources\//.test(filename) && !/\.css$/.test(filename));
		},

		amd: function (filename, mid) {
			return !this.copyOnly(filename, mid) && /\.js$/.test(filename);
		},

		miniExclude: function (filename, mid) {
			return mid in {
				'app/package': 1
			};
		}
	}
};