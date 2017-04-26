'use strict';

var Marionette = require('backbone.marionette');
var template = require('./reportBuilder.html');

var reportBuilder = Marionette.View.extend({
	el : '.application__content',
	template : template,
	events : {
		
	},
	ui : {
		
	}/*,
	onRender: function () {
		
	}*/
});


module.exports = new reportBuilder;
