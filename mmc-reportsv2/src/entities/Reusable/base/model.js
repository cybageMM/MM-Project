'use strict';

var Model = require('backbone').Model;
var path = require('../../components/url-parser/index');
var _ = require('underscore');

/**
 * method to be used when one need to parse model-like set of attributes containing links retrieving the links as they would be in the real model.
 * Needed because we started to use projections with links inside. And structure of the links there is different from the model one because we decided at some point to modify it for model :(
 **/
var getParsedLinks = function(links) {
  return _.reduce(links, function(memo, value, key) {
    memo[key] = path(value.href);
    return memo;
  }, {});
};

module.exports = Model.extend({

  parse: function(data) {
    var links;
    if (data) {
      links = data._links;
      delete data._links;

      this._links = getParsedLinks(links);
    } else {
      this._links = [];
    }

    return data;
  },

  link: function(requestedLink) {
    var link = this._links[requestedLink];
    if (_.isUndefined(link)) throw new Error('Requested link was not found.');
    return link;
  }
}, {
  getParsedLinks: getParsedLinks
});
