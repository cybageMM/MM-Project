'use strict';

var Marionette = require('backbone.marionette');
var dataTable = require('components/datatable/view');
var _ = require('underscore');
var renderer = require('components/datatable/renderer');
var template = require('./reports.html');
var history = require('backbone').history;
var Model = require('entities/reportList-model');
var Collection = require('entities/reportList-collection');
var reportList = Marionette.View.extend({
	el : '.application__content',
	template : template,
	model: Model,
	events : {},
	ui : {
		favouriteReportTable : "#favouriteReportTable",
		sharedReportTable : "#sharedReportTable",
		myReportTable : "#myReportTable",
	},
	onRender: function () {
		var self = this;
		var reportsCollection = new Collection();
		var options = {};
		options.headers = {'JWT-TOKEN' : 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjeWJhZ2VfZGV2Ojo6V0IiLCJpYXQiOjE0OTI2Nzc1NTR9.xw4umBu_xPlvyJzBjkTvqII4Q9zEMpw1rk18K5xr4-U'};
		options.success = onReportListSuccess.bind(this);
		options.error = this.onReportListError;
		reportsCollection.fetch(options);
	},
	onReportListError: function (event, response) {
		console.log(response)
	},
	onDestroy: function () {
		console.log("Test");
	}
});

var onReportListSuccess = function (event, response) {
	var favList = [], sharedList = [], myList = [];
	var self = this;
	var columns = [
        { title: "Report Name", data: "saveReportName" },
        { title: "Report Description", data: "description" },
        { title: "Report Template", data: "templateName"},
        { title: "Last Executed", data: "lastRun"},
        { title: "Actions", data: "action", render: renderer.actionIconRendere}
    ];
	_.each(response, function (report) {
		report.action = "";
		if(report.isFavorite) {
			favList.push(report);
		}
		else if(report.isShared) {
			sharedList.push(report);
		}
		else {
			myList.push(report);
		}
	});
	var favouriteTableInstance = new dataTable();
	var sharedReportTableList = new dataTable();
	var myReportTableList = new dataTable();
	favouriteTableInstance.renderTable(self.ui.favouriteReportTable, favList, columns);
	sharedReportTableList.renderTable(self.ui.sharedReportTable, sharedList, columns);
	myReportTableList.renderTable(self.ui.myReportTable, myList, columns);
}

module.exports = new reportList;
