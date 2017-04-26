'use strict';

var Backbone = require('backbone');
var constants = require('application/constants');

var UserModel = Backbone.Model.extend({
	url: function() {
		return 'dist/response/userDetail.json';
		//return constants.SERVICE_URL.URL_GET_USER_API;
	}
});

var userObject = new UserModel();
module.exports = userObject;
