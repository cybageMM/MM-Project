"use strict";
require('select2');
var $ = require('jquery');
var _ = require('underscore');

var API = {
  'init': function(element, options) {
    var _updateLinks = function(value, count, $selectAll, $deselectAll) {
      if (value.length > 0) {
        $deselectAll.css('display', 'inline');
      } else {
        $deselectAll.css('display', 'none');
      }
      if (value.length === count) {
        $selectAll.css('display', 'none');
      } else {
        $selectAll.css('display', 'inline');
      }
    };
    var $element = $(element);
    var opts = $.extend({
      'allowSelectAll': false,
      'openOnEnter': false,
      'closeOnSelect': false,
      'containerCssClass': 'mm-select2-form'
    }, options);
    $element.select2.mmCloseOnSelect = function() {
      /**
       * When 'closeOnSelect' option is set to false, it is to fix the scenario when user starts typing
       * in a select2-multi text input to therefore have a select2-multi dropdown list item highlighted.
       */
      var select2DropdownLi = $('#select2-drop.select2-drop-multi li');
      if (select2DropdownLi.filter('.select2-highlighted').length === 0) {
        select2DropdownLi.not(".select2-selected").first().addClass('select2-highlighted');
      }
    };

    var $selectAll;
    var $deselectAll;

    var $select = $element.select2(opts).on("select2-open", function(event) {
      var $parent = $(event.target).data('select2').dropdown;
      if (opts.allowSelectAll) {
        var $list = $(event.target).data('select2').results;
        var data = $list.find('li.select2-result-selectable').not(".select2-result-with-children");
        var all = _.reduce($select.select2('val'), function(memo, itm) {
          memo[itm] = true;
          return memo;
        }, {});
        _.each(data, function(itm) {
          // here I'm using it to make a "set" because in case of grouped selects - values can be duplicated.
          all[$(itm).data('select2Data').id] = true;
        });
        var keys = _.keys(all);
        keys = _.sortBy(keys, function(itm) {
          return all[itm];
        });
        if (keys.length) {
          $selectAll = $('<a class="select2-select-all">').text('Select All').click(function() {
            $select.select2('val', keys);
            $select.trigger('change');
            $select.select2('close');
          });
          $parent.append($selectAll);
          $deselectAll = $('<a class="select2-deselect-all">').text('Remove All').click(function() {
            $select.select2('val', []);
            $select.trigger('change');
            $select.select2('close');
          });
          $parent.append($deselectAll);
          if (!$select.select2('val').length) {
            $deselectAll.css('display', 'none');
          }
          _updateLinks($select.select2('val'), keys.length, $selectAll, $deselectAll);
          $select.on('change', function() {
            _updateLinks($select.select2('val'), keys.length, $selectAll, $deselectAll);
          });
        }
      }

      var select2SingleSelect = $('.select2-container .select2-focusser');
      var select2MultiSelect = $('.select2-container-multi input.select2-input');
      var isSelect2DropdownOpen = true;
      $element.select2.mmClose = function(e) {
        if (e.keyCode === 27 && isSelect2DropdownOpen) {
          e.stopPropagation();
          isSelect2DropdownOpen = false;
          select2SingleSelect.off('keyup', $element.select2.mmClose);
          select2MultiSelect.off('keyup', $element.select2.mmClose);
        }
      };
      select2SingleSelect.on('keyup', $element.select2.mmClose);
      select2MultiSelect.on('keyup', $element.select2.mmClose);

      $('#select2-drop.select2-drop-multi li:not(.select2-selected):first').addClass('select2-highlighted');
      $('.select2-search-field .select2-input').on('keyup', $element.select2.mmCloseOnSelect);
    }).on('change', function() {
      $('#select2-drop.select2-drop-multi li:not(.select2-selected):first').addClass('select2-highlighted');
    }).on('select2-close', function() {
      $('.select2-search-field .select2-input').off('keyup', $element.select2.mmCloseOnSelect);
      if ($selectAll) {
        $selectAll.remove();
      }
      if ($deselectAll) {
        $deselectAll.remove();
      }
    });

    $element.css('display', 'inline');
    $element.addClass('mm-select2-offscreen');

    return $select;
  },
  'destroy': function(element) {
    var $element = $(element);
    $element.select2('destroy');
    $element.css('display', '');
    $element.removeClass('mm-select2-offscreen');
  },
  'open': function(element) {
    $(element).select2('open');
  }
};
// TODO: docs
module.exports = function(element, method) {
  var result;
  if (API[method]) {
    var args = [].slice.call(arguments);
    // Remove the method, leaving the element and the rest of the arguments.
    args.splice(1, 1);
    result = API[method].apply(null, args);
  } else if (typeof method === 'object' || !method) {
    result = API.init.apply(null, arguments);
  } else {
    throw ('Method ' + method + ' does not exist on mm-Select2');
  }
  return result;
};
