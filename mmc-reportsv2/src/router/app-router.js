'use strict';

var Router = require('backbone-routing').Router;
var Radio = require('backbone.radio');
var Marionette = require('backbone.marionette');
var _ = require('underscore');

var AppRouter = Router.extend({

  routerOptions: ['container', 'LayoutView', 'prefix', 'subRouters', 'headerViewData'],

  titleChannel: Radio.channel('app:head:title'),

  /**
   * Setup
   * @param options
   */
  initialize: function(options) {
    this.listenTo(this, 'before:route', _.bind(this.updateTitle, this));
  },

  updateTitle: function() {
    this.titleChannel.trigger('route:change');
  },

  onBeforeEnterRoute: function() {
	  console.log('test');
	  console.log('Test');
  },

  onRouterError: function(obj, error) {
    console.error(error);
    console.error('\nfrom: ' + obj);
  }

});

module.exports = AppRouter;
