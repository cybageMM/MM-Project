'use strict';

var $ = require('jquery');

/**
 * A custom plugin for showing partially or all of a long block of text with "show more >" or "show less >" links.
 *
 * @param $selector {jQuery} element (ideally a div or span. Form control elements are prohibited)
 * @param text {string}
 * @param maxLength {number}
 * @constructor TextMoreLess
 */
var TextMoreLess = function($selector, text, maxLength) {
  var shortText;
  var showLess = this.showLess = $('<a class="text-toggle btn-link-black btn-link hidden">').text('show less...');
  var showMore = this.showMore = $('<a class="text-toggle btn-link-black btn-link">').text('show more...');

  if (text.length > maxLength) {
    shortText = text.substring(0, maxLength);

    showLess.on('click', function() {
      $selector.html(shortText);
      showLess.addClass('hidden');
      showMore.removeClass('hidden');
    });
    showMore.on('click', function() {
      $selector.html(text);
      showMore.addClass('hidden');
      showLess.removeClass('hidden');
    });

    $selector.html(shortText).parent().append(showMore).append(showLess);
  }
};

/**
 *  To check and properly remove the link elements out of the DOM in addition to all bound events to those links.
 */
TextMoreLess.prototype.destroy = function() {
  if (this.showLess) {
    this.showLess.remove();
  }
  if (this.showMore) {
    this.showMore.remove();
  }
};

module.exports = TextMoreLess;
