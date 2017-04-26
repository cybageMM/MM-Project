'use strict';
var Backbone = require("backbone");
var moment = require('moment');
var constants = require('application/constants');

module.exports = {

    setSessionTime : function() {
	    var sessionTime = moment()
	            .add(constants.SESSION_EXPIRE_TIME, 'minutes');
	    return sessionTime;
    },
    getCurrentRouter : function() {
	    var routeLocation = Backbone.history.location
	    var appUrl = routeLocation.origin + routeLocation.pathname;
	    var apphref = routeLocation.href;
	    var currentRoute = apphref.split(appUrl)[1];
	    return currentRoute.split('#')[1];
    },
    getLockIcon: function (report, reportType) {
    	var lockIconDetail = {};
    	var lockIcon = '';
    	var lockIconClass = '';
    	var linkClass = '';
    	var isLink = '';
    	if(report.isFavorite) {
    		lockIcon = report.isShared ? 'fa-unlock' : (report.isPrivate ? 'fa-lock' : 'fa-unlock');
    		lockIconClass = report.isShared ? 'unlock-icon-grey' : (report.isPrivate ? 'lock-icon-black' : 'unlock-icon-black');
    		linkClass = report.isShared ? 'unlock-report-gry-link' : (report.isPrivate ? 'lock-report-link' : 'unlock-reort-link');
    		isLink = !report.isShared;
    	}
    	else if(report.isShared) {
    		lockIcon = 'fa-unlock';
    		lockIconClass = 'unlock-icon-grey';
    		linkClass = 'unlock-icon-grey-link';
    		isLink = false;
    	}
    	else {
    		lockIcon = report.isPrivate ? 'fa-lock' : 'fa-unlock';
    		lockIconClass = report.isPrivate ? 'lock-icon-black' : 'unlock-icon-black';
    		linkClass = report.isPrivate ? 'lock-report-link' : 'unlock-reort-link';
    		isLink = true;
    	}
    	lockIconDetail.icon = lockIcon;
    	lockIconDetail.className = lockIconClass;
    	lockIconDetail.linkClass = linkClass;
    	lockIconDetail.isLink = isLink;
    	return lockIconDetail;
    },
    getDeleteIcon: function (report) {
    	var deleteIconDetail = {};
    	deleteIconDetail.icon = 'fa-trash-o';
    	deleteIconDetail.className = report.isShared ? 'delete-icon-grey' : 'delete-icon-black';
    	deleteIconDetail.linkClass = report.isShared ? 'delete-report-grey-link' : 'delete-report-link';
    	deleteIconDetail.isLink = !report.isShared;
    	return deleteIconDetail;
    },
    getFavouriteIcon: function (reportType) {
    	var favouriteIconDetail = {};
    	favouriteIconDetail.icon = reportType === 'favourite' ? 'fa-star' : 'fa-star-o';
    	favouriteIconDetail.className = 'star-icon';
    	favouriteIconDetail.linkClass = reportType === 'favourite' ? 'favourite-icon-link' : 'unfavourite-icon-link';;
    	favouriteIconDetail.isLink = true;
    	return favouriteIconDetail;
    },
    getscheduleIcon: function (report) {
    	var scheduleIconDetail = {};
    	scheduleIconDetail.icon = 'fa-clock-o';
    	scheduleIconDetail.className = 'schedule-icon';
    	scheduleIconDetail.linkClass = 'schedule-icon-link';
    	scheduleIconDetail.isLink = true;
    	return scheduleIconDetail;
    },
    getRowId: function (data) {
    	var rowId =  parseInt(data.currentTarget.attributes.rowid.nodeValue);
    	return rowId;
    }
};
