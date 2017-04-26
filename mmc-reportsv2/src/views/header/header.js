'use strict';

var Marionette = require('backbone.marionette');
var HeaderTemplate = require('./header.html');
var MetaData = require('services/metadata/storage');
var UserData = require('services/user/storage');
var _ = require('underscore');

var headerView = Marionette.View.extend({
	el : '.application__header',

	template : HeaderTemplate,

	serializeData: function() {
		return {
			labelData1: MetaData.getMetadata(),
			userData: UserData.getCurrentUser(),
			labelData: {
				accounting_label: "Accounting",
				reporting_label: "Reporting",
				contracts_label: "Contracts",
				fullName:	"Cybage Dev",
				myProfile_label: "My Profile",
				manage_password_label: "Manage Password",
				logout_label: "Logout"

			}

		}
	}
});

module.exports = new headerView;
