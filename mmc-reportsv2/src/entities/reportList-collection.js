
'use strict';

var BaseCollection = require('backbone').Collection;
// var BaseCollection = require('./base/collection/collection');
var Model = require('./reportList-model');
var constants = require('application/constants');

module.exports = BaseCollection.extend({
    model: Model,

    url: function() {
        return 'dist/response/reportList.json';
        //return constants.SERVICE_URL.GET_SAVED_REPORT;
    }
});
