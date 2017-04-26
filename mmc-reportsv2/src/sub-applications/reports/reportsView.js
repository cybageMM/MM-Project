'use strict';

var Marionette = require('backbone.marionette');
var dataTable = require('components/datatable/view');
var _ = require('underscore');
var renderer = require('components/datatable/renderer');
var template = require('./reports.html');
var SharedReportsCollection = require('entities/shared/sharedReportList-collection');
var FavouriteReportsCollection = require('entities/favourite/favReportList-collection');
var MyReportsCollection = require('entities/my-reports/reportList-collection');
var IsFavReportModel = require('entities/favourite/favReport-model');
var utils =  require('application/utils');

var favList = [], sharedList = [], myList = [];
var columns = [
               { title: "Report Name", data: "saveReportName", render: renderer.linkWithIconRenderer},
               { title: "Report Description", data: "description" },
               { title: "Report Template", data: "templateName"},
               { title: "Last Executed", data: "lastRun"},
               { title: "Actions", data: "action", render: renderer.actionIconRenderer}
           ];

var reportList = Marionette.View.extend({
	el : '.application__content',
	template : template,
	//model: Model,
	events : {
		'click .schedule-icon-link' : 'scheduleReport',
		'click .favourite-icon-link' : 'unFavouriteReport',
		'click .unfavourite-icon-link' : 'favouriteReport',
		'click .delete-report-link': 'deleteReport',
		'click .lock-report-link': 'unLockReport',
		'click .unlock-reort-link': 'lockReport'
	},
	ui : {
		favouriteReportTable : "#favouriteReportTable",
		sharedReportTable : "#sharedReportTable",
		myReportTable : "#myReportTable"
	},
	onRender: function () {
		getListFromAPI(this);
	},
	onReportListError: function (event, response) {
		console.log(response)
	},
	onDestroy: function () {
		console.log("Test");
	},
	scheduleReport: function(event, data) {
		console.log(event.currentTarget.attributes.rowid);
		console.log(data);
	},
	unFavouriteReport: function(event) {
		event.preventDefault();
		var rowId = utils.getRowId(event);
		var options = {};
		options.type = 'POST';
		options.contentType = "application/json";
		options.success = onIsFavReportSuccess.bind(this);
		options.error = onReportListError;
		var isFavReportModel = new IsFavReportModel();
		isFavReportModel.set({saveReportId: rowId, isFavorite: true});
		isFavReportModel.fetch(options);
	},
	favouriteReport: function(event, data) {
		console.log(event);
		console.log(data);
	},
	deleteReport: function(event, data) {
		console.log(event);
		console.log(data);
	},
	unLockReport: function(event, data) {
		console.log(event);
		console.log(data);
	},
	lockReport: function(event, data) {
		console.log(event);
		console.log(data);
	}
});

var getListFromAPI = function (context) {
	var self = context;
	var myReportList = new MyReportsCollection();
	var sharedReportsCollection = new SharedReportsCollection();
	var favReportsCollection = new FavouriteReportsCollection();
	var options = {}, optionsShared = {}, optionsFavourite = {};
	//options.headers = {'JWT-TOKEN' : 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjeWJhZ2VfZGV2Ojo6V0IiLCJpYXQiOjE0OTI2Nzc1NTR9.xw4umBu_xPlvyJzBjkTvqII4Q9zEMpw1rk18K5xr4-U'};
	options.success = onReportListSuccess.bind(context);
	options.error = onReportListError;
	optionsShared.success = onSharedReportListSuccess.bind(context);
	optionsShared.error = onReportListError;
	optionsFavourite.success = onFavouriteReportListSuccess.bind(context);
	optionsFavourite.error = onReportListError;
	myReportList.fetch(options);
	sharedReportsCollection.fetch(optionsShared);
	favReportsCollection.fetch(optionsFavourite);
};

var onReportListSuccess = function (event, response) {
	var self = this;
	var favouriteIcon, scheduleIcon, lockIcon, deleteIcon;
	_.each(response, function (report) {
		scheduleIcon = utils.getscheduleIcon(report);
		favouriteIcon = utils.getFavouriteIcon('my');
		lockIcon = utils.getLockIcon(report);
		deleteIcon = utils.getDeleteIcon(report);
		report.action = {icons: [{icon: scheduleIcon.icon, 'icon-class': scheduleIcon.className, linkClass: scheduleIcon.linkClass, isLink: scheduleIcon.isLink}, {icon: deleteIcon.icon, 'icon-class': deleteIcon.className, linkClass: deleteIcon.linkClass, isLink: deleteIcon.isLink}]};
		report.saveReportName = {data:report.saveReportName, icons: [{icon: favouriteIcon.icon, 'icon-class': favouriteIcon.className, linkClass: favouriteIcon.linkClass, isLink: favouriteIcon.isLink}, {icon: lockIcon.icon, 'icon-class': lockIcon.className, linkClass: lockIcon.linkClass, isLink: lockIcon.isLink}]};
		myList.push(report);
	});
	var myReportTableList = new dataTable();
	myReportTableList.renderTable(self.ui.myReportTable, myList, columns);
};

var onSharedReportListSuccess = function (event, response) {
	var self = this;
	var favouriteIcon, scheduleIcon, lockIcon, deleteIcon;
	console.log(response)
	_.each(response, function (report) {
		scheduleIcon = utils.getscheduleIcon(report);
		favouriteIcon = utils.getFavouriteIcon('shared');
		lockIcon = utils.getLockIcon(report);
		deleteIcon = utils.getDeleteIcon(report);
		report.action = {icons: [{icon: scheduleIcon.icon, 'icon-class': scheduleIcon.className, linkClass: scheduleIcon.linkClass, isLink: scheduleIcon.isLink}, {icon: deleteIcon.icon, 'icon-class': deleteIcon.className, linkClass: deleteIcon.linkClass, isLink: deleteIcon.isLink}]};
		report.saveReportName = {data:report.saveReportName, icons: [{icon: favouriteIcon.icon, 'icon-class': favouriteIcon.className, linkClass: favouriteIcon.linkClass, isLink: favouriteIcon.isLink}, {icon: lockIcon.icon, 'icon-class': lockIcon.className, linkClass: lockIcon.linkClass, isLink: lockIcon.isLink}]};
		sharedList.push(report);
	});
	var sharedReportTableList = new dataTable();
	sharedReportTableList.renderTable(self.ui.sharedReportTable, sharedList, columns);
};

var onFavouriteReportListSuccess = function (event, response) {
	var self = this;
	var favouriteIcon, scheduleIcon, lockIcon, deleteIcon;
	_.each(response, function (report) {
		scheduleIcon = utils.getscheduleIcon(report);
		favouriteIcon = utils.getFavouriteIcon('favourite');
		lockIcon = utils.getLockIcon(report);
		deleteIcon = utils.getDeleteIcon(report);
		report.action = {icons: [{icon: scheduleIcon.icon, 'icon-class': scheduleIcon.className, linkClass: scheduleIcon.linkClass, isLink: scheduleIcon.isLink}, {icon: deleteIcon.icon, 'icon-class': deleteIcon.className, linkClass: deleteIcon.linkClass, isLink: deleteIcon.isLink}]};
		report.saveReportName = {data:report.saveReportName, icons: [{icon: favouriteIcon.icon, 'icon-class': favouriteIcon.className, linkClass: favouriteIcon.linkClass, isLink: favouriteIcon.isLink}, {icon: lockIcon.icon, 'icon-class': lockIcon.className, linkClass: lockIcon.linkClass, isLink: lockIcon.isLink}]};
		favList.push(report);
	});
	var favReportTableList = new dataTable();
	favReportTableList.renderTable(self.ui.favouriteReportTable, favList, columns);
}

var onIsFavReportSuccess = function (context) {
	getListFromAPI(context);
}
var onReportListError = function (event, response) {
	console.log(response)
}
module.exports = new reportList;
