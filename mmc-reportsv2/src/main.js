
    'use strict';

    global.jQuery = require('jquery');
    require('bootstrap');
    var MetaDataStorage = require('./services/metadata/storage');
    var UserStorage = require('./services/user/storage');
    require('application/application');
    require('router/router');
    window.Promise = require('bluebird');
    var history = require('backbone').history;
    var Header = require('views/header/header');
    var labelDataModel = require('entities/labelData/labelDataModel');

    var userInformation;

    /*MetaDataStorage.setup().then() {
    	UserStorage.getCurrentUser();
    });*/
    UserStorage.getCurrentUser().then(function(user) {
      userInformation = user;
      MetaDataStorage.setup();
    }).then(function() {
    	history.start();
    	Header.render();
    })
