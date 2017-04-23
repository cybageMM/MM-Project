'use strict';

var Model = require('backbone').Model;
var _ = require('underscore');

var MetaDataModel = Model.extend({
  defaults: {},

  url: function() {
    return 'dist/labels/label-en.json';
  },
});

module.exports = MetaDataModel;
