'use strict';
// var BaseModel = require('./base/model');
var BaseModel = require('backbone').Model;
var _ = require('underscore');
var constants = require('application/constants');

module.exports = BaseModel.extend({
  urlRoot: function() {
    return 'dist/response/reportList.json';
    //return constants.SERVICE_URL.FAVOURITE_REPORT_LIST;
  }

});
