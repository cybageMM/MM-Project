
'use strict';

global.jQuery = require('jquery');
require('bootstrap');
var MetaDataStorage = require('./services/metadata/storage');
var UserStorage = require('./services/user/storage');
require('application/application');
require('router/router');
//window.Promise = require('bluebird');
var history = require('backbone').history;

var userInformation;

UserStorage.getCurrentUser().then(function(user) {
  userInformation = user;
}).then(function() {
	history.start();
})
