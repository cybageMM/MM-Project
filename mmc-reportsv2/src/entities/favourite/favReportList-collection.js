
'use strict';

var BaseCollection = require('backbone').Collection;
// var BaseCollection = require('./base/collection/collection');
var Model = require('../my-reports/reportList-model');
var constants = require('application/constants');

module.exports = BaseCollection.extend({
    model: Model,

    url: function() {
        return 'dist/response/reportList.json';
        //return constants.SERVICE_URL.FAVOURITE_REPORT_LIST;
    }
});
