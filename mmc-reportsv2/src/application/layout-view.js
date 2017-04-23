'use strict';

var LayoutView = require('backbone.marionette').View;
var template = require('./layout-template.html');
var Region = require('backbone.marionette').Region;

var ModalRegion = Region.extend({
  attachHtml: function(view) {
    this.$el.empty().append(view.el);
  }
});

module.exports = LayoutView.extend({
  el: '.application',
  template: template,

  regions: {
    header:  '.application__header',
    flashes: '.application__flashes',
    content: '.application__content',
    overlay: {
      regionClass: ModalRegion,
      selector:  '.application__overlay'
    }
  }
});
