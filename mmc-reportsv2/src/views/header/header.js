'use strict';

var Marionette = require('backbone.marionette');
var HeaderTemplate = require('./header.html');
var _ = require('underscore');

var headerView = Marionette.View.extend({
	el : '.application__header',
	template : HeaderTemplate,

	onRender: function () {
        // To-Do Additional functionalities for header
	}
});

module.exports = new headerView;
