'use strict';
var $ = require('jquery');

module.exports = {

  spinnerCell: ".mmprogress",

  hideSpinner: function() {
    if (!$(this.spinnerCell ).hasClass('hidden')) {
      $(this.spinnerCell ).addClass('hidden');
    }
  },

  showSpinner: function() {
    if ($(this.spinnerCell ).hasClass('hidden')) {
      $(this.spinnerCell ).removeClass('hidden');
    }
  }
};
