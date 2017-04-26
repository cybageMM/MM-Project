'use strict';

var Application = require('backbone.marionette').Application;
var LayoutView = require('./layout-view');
var $ = require('jquery');

var MDRApplication = Application.extend({
  initialize: function() {
    this.$body = $(document.body);
    this.layout = new LayoutView();
    this.layout.render();  
  },
});

module.exports = new MDRApplication();
