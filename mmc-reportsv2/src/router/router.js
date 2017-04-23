'use strict';

var AppRouter = require('backbone-routing').Router;
var ReportsView = require('sub-applications/reports/reportsView');
var Header = require('views/header/header');

var ApplicationRouter = AppRouter.extend({

	initialize: function(options) {
    	Header.render();
    },

	routes : {
		'' : 'reports',
		'reportList' : 'reports'
	},

	reports: function() {
		ReportsView.render();
	}
});

module.exports = new ApplicationRouter();
