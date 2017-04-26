'use strict';

var AppRouter = require('backbone-routing').Router;
var ReportsView = require('sub-applications/reports/reportsView');
var ReportBuilderView = require('sub-applications/reports/reportsBuilderView');
var Header = require('views/header/header');

var ApplicationRouter = AppRouter.extend({

	initialize: function(options) {
    	
    },
	routes : {
		'' : 'reports',
		'reportList' : 'reports',
		'reportBuilder' : 'reportBuilder'
	},
	reports: function() {
		ReportsView.render();
	},
	reportBuilder: function () {
		ReportBuilderView.render();
	}
});

module.exports = new ApplicationRouter();
