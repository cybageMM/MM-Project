'use strict';

var Storage = require('backbone.storage');
var MetaDataModel = require('./metadata-model');
var _ = require('underscore');

var metaDataStorage = Storage.extend({
  model: MetaDataModel,
  metaDataCache: {},

  setup: function() {
    var Metadata = this.model;

    if (!_.isEmpty(this.metaDataCache)) {
      return Promise.resolve(this.metaDataCache);
    } else {
      this.metaDataCache = new Metadata();
      this.metadataReq = this.metaDataCache.fetch();
    }

    return Promise.resolve(this.metadataReq);
  },
});

module.exports = new metaDataStorage();
