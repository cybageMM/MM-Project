'use strict';

var BaseCollection = require('./base/collection/collection');
var Model = require('./user-model');

module.exports = BaseCollection.extend({
  model: Model,

  url: function() {
    return 'dist/response/userDetail.json';
  }

});
