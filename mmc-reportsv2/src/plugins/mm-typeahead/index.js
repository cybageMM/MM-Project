'use strict';

var $ = require('jquery');
var _get = require('lodash').get;
/**
 * Mediamorph Typeahead is based on twitter-typeahead and was created to be able to handle a 'text'-'value' combination,
 * since by default it is not provided by the component.
 *
 * This also adds decorators to the field wrapping the element inside a div adding a fa-search
 * icon.
 *
 * @param element: HTML element to append the typeahead functionality.
 * @param options {object}: JSON object with the configuration for typeahead, it basically uses the same
 * configuration as twitter-typeahead, additional to those attributes are incorporated:
 *     'createText' {string}: The object property to use as text.
 *     'createValue' {string}: The object property to use as value.
 * @param stores: {array}: Array of objects with the different Stores configurations.
 * @constructor
 */
function Typeahead(element, options, datasets) {
  if (!element || !(element.jquery || element.nodeType)) {
    throw new Error('Typeahead(element, options) :: input "element" is required to create a Typeahead');
  }

  options = options || {};

  this.defaults = {
    'createText': null,
    'createValue': null
  };

  this.options = $.extend(true, {}, this.defaults, options);
  this.settings = $.extend({}, this.options);

  this._buildHTML(element);

  // Create the Jquery element
  this.$element = $(element);

  var attr = this.settings;
  this._onBlur = this.onBlur.bind(this);
  this._onKeyup = this.onKeyup.bind(this);
  this.isOpen = false;
  this._lastValue = null;

  this.$element.typeahead(this.settings, datasets)
    .on('typeahead:select', function(query, item) {
      this.setValue(item);
    }.bind(this))
    .on('typeahead:autocomplete', function(event, item) {
      this.setValue(item);
    }.bind(this))
    .on('typeahead:cursorchange', function(query, item) {
      if (item && attr.createValue) {
        this.value = _get(item, attr.createText);
      }
    }).on('typeahead:open', function() {
      this.isOpen = true;
    }.bind(this)).on('typeahead:close', function() {
      this.isOpen = false;
    }.bind(this))
      .on('blur', this._onBlur)
      .on('keyup', this._onKeyup);
}

Typeahead.prototype = {
  isOpen: false,

  getValue: function() {
    return this.$element.data('typeahead-value');
  },

  setValue : function(item) {
    this._lastValue = item;
    this.$element.typeahead('val', _get(item, this.settings.createText));
    this.$element.data('typeahead-value', _get(item, this.settings.createValue) || '');
    this.$element.change();
    this._updateClearButton();
  },
  /**
   * Listener for blur action for the $element field that allows to cleanup
   * the field if either the text field or value field are empty.
   *
   * @private
   */
  onBlur: function() {
    if (!this.$element.data('typeahead-value')) {
      this.$element.val('');
    }
    if (!this.$element.val()) {
      this.setValue();
    }
  },
  /**
   * The Escape keyup event is prevented by default since this
   * is causing some scenarios where the modal view is closed.
   * @param e
   */
  onKeyup: function(e) {
    // Disable to propagate on escape.
    if (e.keyCode === $.ui.keyCode.ESCAPE) {
      e.stopPropagation();
      e.preventDefault();
      // Allow to reset the latest value on Escape
      if (!this.isOpen) {
        this.setValue(this._lastValue);
      }
    }
  },

  _updateClearButton: function() {
    if (!$.trim(this.$element.val())) {
      this._clearButton.addClass('hidden');
    } else {
      this._clearButton.removeClass('hidden');
    }
  },

  _clearField: function() {
    this.setValue();
  },

  /**
   * Wrap the input search text inside a div container that includes the search image and
   * the input text value.
   *
   * @param element
   * @private
   */
  _buildHTML: function(element) {
    var $element = $(element);

    this._clearButton = $('<span class="fa fa-times-circle mm-typeahead__clear-btn hidden"></span>');
    this._clearButton.on('click', this._clearField.bind(this));

    $element.wrap('<div></div>').parent().addClass('mm-typeahead')
      .append('<span class="fa fa-search mm-typeahead__search-icon"></span>').append(this._clearButton);
  },

  destroy: function() {
    this._clearButton.off('click');
    this.$element.off('blur', this._onBlur);
    this.$element.off('keyup', this._onKeyup);
    return this.$element.typeahead('destroy');
  }
};
module.exports = Typeahead;
