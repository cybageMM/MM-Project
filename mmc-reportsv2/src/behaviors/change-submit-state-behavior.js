'use strict';

var Behavior = require('backbone.marionette').Behavior;
module.exports = Behavior.extend({
  /**
   * Disables action buttons and links. Example: submit button
   * @param btn
   */
  onDisableActionBtn: function(btn) {
    if (btn.is('a')) {
      btn.addClass('js-disabled');
    } else if (btn.is('button') || btn.is('input')) {
      btn.attr('disabled', 'disabled');
    }
  },

  /**
   * Enables an action button or a link if it has already been disabled by onDisableActionBtn
   */
  onEnableActionBtn: function(btn) {
    if (btn instanceof jQuery) {
      btn.removeClass('js-disabled').removeAttr('disabled');
    }
  }
});
