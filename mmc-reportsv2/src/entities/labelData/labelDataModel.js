'use strict';

var Model = require('backbone').Model;

var labelData = Model.extend({
	url: function() {
		return "dist/labels/label-en.json";
	},
	parse: function(response) {
		return response;
	}
});

var labelDataObject = new labelData();

module.exports = labelDataObject;
