'use strict';

var Storage = require('backbone.storage');
var MetaDataModel = require('./metadata-model');
var _ = require('underscore');

var metaDataStorage = Storage.extend({
  model: MetaDataModel,
  metaDataCache: {},

  setup: function() {
    /*var Metadata = this.model;

    if (!_.isEmpty(this.metaDataCache)) {
      return Promise.resolve(this.metaDataCache);
    } else {
      this.metaDataCache = new Metadata();
      this.metadataReq = this.metaDataCache.fetch();
    }*/
	var _this = this;
    var Metadata = this.model;
	if(this.metaData) {
		this.metaData = new Metadata();
		this.metadataReq = this.metaData.fetch();
	}
	return Promise.resolve(this.metadataReq);
  },
  getMetadata: function() {
	if (!_.isEmpty(this.metaDataCache)) {
	  return this.metaDataCache;
	}
	
	console.log("The default lookup values are not initialized");
	return undefined;
  }
});

module.exports = new metaDataStorage();
