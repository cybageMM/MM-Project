'use strict';
var BaseModel = require('./base/model');
var _ = require('underscore');

module.exports = BaseModel.extend({
  urlRoot: function() {
    return 'dist/response/userDetail.json';
  }

});
