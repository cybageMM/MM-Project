'use strict';

var $ = require('jquery');

/**
 * A custom plugin for showing partially or all items from the list with "show more" or "show less" links.
 *
 * @param $parent {jQuery} element to which "show less" and "show more" links will be appended
 * @param $toggleItems [] array of {jQuery} elements - a part of the whole list of items
 * that will be shown or hidden. Assumed that $toggleItems will be prepared by view itself.
 * Example:
 * $toggleItems = this.$('.attachment:gt(' + (this.maxLimitDisplay - 1) + ')')
 * In such a way we get all blocks with class="attachment" that are over the maxLimitDisplay limit and need to be hidden
 * @constructor ItemsMoreLess
 */
var ItemsMoreLess = function($parent, $toggleItems) {
  var showLess = this.showLess = $('<a class="text-toggle btn btn-link-black btn-link btn-sm hidden">').text('show less...');
  var showMore = this.showMore = $('<a class="text-toggle btn btn-link-black btn-link btn-sm">').text('show more...');

  if ($toggleItems && $toggleItems.length > 0) {
    $toggleItems.hide();

    showLess.on('click', function() {
      $toggleItems.hide();
      showLess.addClass('hidden');
      showMore.removeClass('hidden');
    });
    showMore.on('click', function() {
      $toggleItems.show();
      showMore.addClass('hidden');
      showLess.removeClass('hidden');
    });

    $parent.append(showMore).append(showLess);
  }
};

/**
 *  To check and properly remove the link elements out of the DOM in addition to all bound events to those links.
 */
ItemsMoreLess.prototype.destroy = function() {
  if (this.showLess) {
    this.showLess.remove();
  }
  if (this.showMore) {
    this.showMore.remove();
  }
};

module.exports = ItemsMoreLess;
