'use strict';

var Collection = require('backbone').Collection;
var Model = require('./model');
var _ = require('underscore');
var path = require('../../components/url-parser/index');

/**
 * @class BaseCollection
 * @classdesc
 * This class defines additions to standard Backbone.Collection to make it more comfortable to use in Mediamorph's (MM) API environment.
 *
 * How to define and use endpoints feature:
 *
 * In MM API some entities may have several nested endpoints for different operations.
 * So to use same Collection class for different operations (e.g. for searching instead of retrieval) you would have to manually change `url` property
 * of collection (very dirty) or extend same entity with different urls (lots of files).
 * To avoid these situations, you can define endpoints in collection as static property that will be converted to instance methods of collection
 * that will change collections `url` property with the one from configuration and fetch it with provided params like in original
 * `fetch` method. First endpoint in the list becomes default endpoint for collection.
 *
 * @example
 *
 * // In app configuration we have defined such endpoints:
 * "urls": {
 *  "attachments": "/pltm/attachments/",
 *  "findAttachmentByProduct": "/pltm/attachments/search/findByProduct",
 *  "findAttachmentByProductName": "/pltm/attachments/search/findByProductName"
 *   ...
 * }
 *
 * // Then we pass those endpoints to Collections definition:
 * var AttachmentsCollection = Collection.extend({
 *    model: AttachmentModel
 * }, {
 *    endpoints: [
 *      'attachments',
 *      'findByProduct',
 *      'findByProductName',
 *      'findByProductAndComponent'
 * });
 *
 * var myCollection = new AttachmentsCollection();
 *
 * myCollection.findByProduct({
 *  data: {product: 'something'},
 *  success: function(result) {
 *    // do something with fetched stuff
 *  }
 * });
 */
module.exports = Collection.extend(
  /** @lends HalCollection.prototype */
  {
    model: Model,

    idAttribute: "id",

    constructor: function() {
      var args = [];

      if (arguments.length > 0 && !(Array.isArray(arguments[0]) || arguments[0] === null)) {
        args = args.concat(null, Array.prototype.slice.call(arguments));
      } else {
        args = arguments;
      }

      Collection.prototype.constructor.apply(this, args);
    },

    initialize: function() {
      var options = this.parseInitializeArgs(arguments);

      if (!_.isNumber(options.page)) {
        options.page = 0;
      }

      // See fetch to learn why do we need this additional attribute at a collection level.
      if (options.idAttribute) {
        this.idAttribute = options.idAttribute;
      }

      this._fixSort(options);

      if (!_.isNumber(options.size)) {
        options.size = 20;
      }

      this._queryParams = _.extend({}, options);
      this._totalElements = 0;
      this._totalPages = 0;

      try {
        if (this.constructor.prototype.constructor.endpoints) {
          var endpoints = _.result(this.constructor.prototype.constructor, 'endpoints');
          if (endpoints && endpoints.length) {
            endpoints.forEach(function(endpoint, index) {
              this.constructor.prototype[endpoint] = function() {
                this.url = ConfService.getApplicationUrl(endpoint);
                return this.fetch.apply(this, arguments);
              };
              if (index === 0 && !this.constructor.prototype.url) {
                this.constructor.prototype.url = function() {
                  return ConfService.getApplicationUrl(endpoint);
                };
              }
            }, this);
          }
          // deleting so it won't be initialized again
          delete this.constructor.prototype.constructor.endpoints;
        }
      } catch(error) {
        // preventing null pointer errors
        console.error(error);
      }
    },

    /**
     * Backbone.collection expects two attributes for constructor ([models], [options]).
     * This correctly parses out the options.
     * @param  {Array} args ...really an Array like object.  This is the value for "arguments" that get passed to the
     *                                  initialize method.
     * @return {Object}      options
     */
    parseInitializeArgs: function(args) {
      args = Array.prototype.slice.call(args, 0);
      var options = args.length > 1 ? args[1] : args[0];

      return options || {};
    },

    _fixSort: function(options) {
      // this is unfortunately needed as there still might be some pieces of the application
      // that try to pass String as a sort order.
      if (_.isString(options.sort) && options.sort.length) {
        options.sort = [options.sort];
      } else if (!options.sort || !_.isArray(options.sort)) {
        options.sort = [];
      }
    },

    parse: function(data) {
      //  TODO: why number and size are stored in _queryParams and the others are in this
      if (data && data.page) {
        this._totalElements = data.page.totalElements;
        this._totalPages = data.page.totalPages;
        this._queryParams.page = data.page.number;
        this._queryParams.size = data.page.size;
      }

      if (!data || !data._embedded) return [];

      var resourceName = _.keys(data._embedded)[0];
      var links = data._links;
      delete data._links;

      this._links = _.reduce(links, function(memo, value, key) {
        memo[key] = path(value.href);
        return memo;
      }, {});

      return data._embedded[resourceName] || [];
    },

    // TODO: Figure out a way to test `Function.prototype.call`.
    // TODO: _.extend mutates `this._queryParams`. Write a unit test
    //       to document this behavior.
    fetch: function(options) {
      var _this = this;
      options = options || {};
      if (!options.hasOwnProperty('reset')) {
        options.reset = true;
      }
      options.traditional = true;
      options.data = _.extend(this._queryParams, options.data) || {};

      this._fixSort(options.data);

      if (options.data.sort.length && _.findIndex(options.data.sort, function(itm) {
          return itm.split(',')[0] === _this.idAttribute;
        }) === -1) {
        // All the collections that needs to be sorted - should be also sorted by entityId as a last priority.
        // This is because without it sorting order might be corrupted by changes in secondary fields like "updatedBy" and "updatedOn"
        // and as a result - paging can start bringing same elements on different pages if something like adding to collection
        // or etc - happened in between switching pages.
        // Note - only done when sorting is needed. If the developer choose not to sort - no sorting will be done and such
        // collision will be possible.
        // However this is rarely makes sense not to sort at all. But when it is - it should not be "auto-corrected".
        options.data.sort.push(this.idAttribute);
      }
      return Collection.prototype.fetch.call(this, options);
    },

    setSort: function(sort) {
      return this.fetch({
        data: {
          page: 0,
          sort: [sort]
        }
      });
    },

    /*
     * TODO: not cool. All other methods are passing the options which is merged to _queryParams in fetch method itself.
     * this one is changing the _queryParams directly. Don't think that any real harm is done. However doesn't look
     * right.
     */
    appendSort: function(prop, order) {
      var _this = this;
      prop = prop || "";
      order = order || "";
      if (!_.isArray(this._queryParams.sort)) {
        this._queryParams.sort = (this._queryParams.sort && this._queryParams.sort.length) ? [this._queryParams.sort] : [];
      } else {
        this._queryParams.sort = _.filter(this._queryParams.sort, function(itm) {
          return itm.split(',')[0] !== _this.idAttribute;
        });
      }
      var cur = _.findIndex(this._queryParams.sort, function(itm) {
        return itm.split(',')[0] === prop;
      });
      if (cur > -1) {
        if (order && order.length) {
          this._queryParams.sort[cur] = prop + ',' + order;
        } else {
          this._queryParams.sort.splice(cur, 1);
        }
      } else {
        order = (order && order.length) ? order : 'asc';
        this._queryParams.sort.push(prop + ',' + order);
      }
      return this.fetch({
        data: {
          page: 0
        }
      });
    },

    firstPage: function() {
      if (!this._queryParams.page) return Promise.resolve();
      return this.fetch({
        data: {
          page: 0
        }
      });
    },

    previousPage: function() {
      if (!this._queryParams.page) return Promise.resolve();

      return this.fetch({
        data: {
          page: this._queryParams.page - 1
        }
      });
    },

    nextPage: function() {
      return this.fetch({
        data: {
          page: this._queryParams.page + 1
        }
      });
    },

    lastPage: function() {
      var params = {
        data: {
          page: (this._totalPages > 0) ? (this._totalPages - 1) : 0
        }
      };
      return this.fetch(params);
    },

    // TODO: Need tests...though it'll probably work. (Look at the code!)
    flipTo: function(page) {
      if (this._queryParams.page === page) return Promise.resolve();
      var params = {
        data: {
          page: page
        }
      };
      return this.fetch(params);
    },

    updateSize: function(size, page) {
      var params = {
        data: {
          size: size,
          page: page
        }
      };
      return this.fetch(params);
    },

    // TODO: Need tests.
    // TODO: Why don't we get rid of other getXXX methods and use just this one?
    getParam: function(name) {
      return this._queryParams[name];
    },

    extendParams: function(obj) {
      if (obj) {
        this._queryParams = _.extend({}, this._queryParams, obj);
      }
    },

    setParam: function(name, value) {
      this._queryParams[name] = value;
    },

    // TODO: Need tests.
    getFilters: function() {
      return this.getParam('filters');
    },

    // TODO: Need tests.
    getSort: function() {
      return this.getParam('sort');
    },

    // TODO: Need tests.
    getQuery: function() {
      return this.getParam('query');
    },

    // TODO: Need tests.
    getPage: function() {
      return this.getParam('page');
    },

    // TODO: Need tests.
    getTotalElements: function() {
      return this._totalElements;
    },

    // TODO: Need tests.
    getTotalPages: function() {
      return this._totalPages;
    },

    // TODO: Need tests.
    // TODO: why this is different from other _like attributes (totalPages...). either then or this one should be changed.
    getSize: function() {
      return this.getParam('size');
    }
  }
);
