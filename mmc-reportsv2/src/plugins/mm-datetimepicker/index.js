'use strict';

var $ = require('jquery');

function DateTimePicker(element, options, settings) {
  if (!element || !(element.jquery || element.nodeType)) {
    throw new Error('DateTimePicker(element, options, additionalButtons) :: input "element" is required to create a DateTimePicker');
  }

  options = options || {};
  this.defaults = {
    icons: {
      time: 'fa fa-clock-o',
      date: 'fa fa-calendar',
      up: 'fa fa-chevron-up',
      down: 'fa fa-chevron-down',
      previous: 'fa fa-angle-double-left',
      next: 'fa fa-angle-double-right',
      today: 'fa fa-screenshot',
      clear: 'fa fa-trash',
      close: 'fa fa-remove'
    }
  };

  /**
   *  "options" are used strictly for bootstrap-datetimepicker options
   *  @see http://eonasdan.github.io/bootstrap-datetimepicker/Options/
   *
   *  "settings" are used to extend the behavior of the bootstrap-datetimepicker
   *
   *  shouldReposition (false) - attaches the datetimepicker to the 'body' and repositions
   *
   *  additionalButtons (false) - used to create custom button functionality
   *    example setting :
   *      infiniteEndDate: {
   *        "type": "setDate",
   *        "name": "Open",
   *        "value": "9999-12-31"
   *      }
   */

  this.options = $.extend(this.defaults, options);

  this.settings = $.extend({}, this.options, settings);
  this.settings.shouldReposition = false;
  this.settings.additionalButtons = settings.additionalButtons ? settings.additionalButtons : false;

  /**
   * Because bind function returns a new function,
   * therefore we want to get handle of the returned function for purpose of detaching event callback functions
   */
  this.bound_onKeyUp = this._onKeyUp.bind(this);
  this.bound_onKeyDown = this._onKeyDown.bind(this);
  this.bound_onHide = this._onHide.bind(this);

  this._buildHTML(element);
  this.$element = $(element);
  this.$element.closest('.form-group').addClass('has-feedback');
  this.$element.datetimepicker(this.options);
  this.$element.on('dp.show', this._onShow.bind(this));
}

DateTimePicker.prototype = {
  show: function show(options) {
    options = options || {};

    if (options.shouldReposition) {
      this.settings.shouldReposition = options.shouldReposition;
      this.updateOptions({
        widgetParent: 'body'
      });
    }

    this.$element.data('DateTimePicker').show();
  },

  hide: function hide() {
    this.$element.data('DateTimePicker').hide();
  },

  updateOptions: function updateOptions(options) {
    options = options || {};

    if (!this.$element.data('DateTimePicker')) {
      throw new Error('DateTimePicker :: An instance of DateTimePicker is required to call updateOptions');
    }

    this.$element.data('DateTimePicker').options(options);
  },

  setDate: function setDate(value) {
    if (typeof value !== 'string') {
      throw new Error('DateTimePicker :: setDate(value) - "value" must be of a string');
    }

    this.$element.data('DateTimePicker').date(value);
  },

  destroy: function destroy() {
    this._calendarIcon.off('mousedown');
    this.$element.off();
    if (this.$element.data('DateTimePicker')) {
      this.$element.data('DateTimePicker').destroy();
    }
  },

  positionWidget: function positionWidget($widget, position) {
    if (!$widget) {
      throw new Error('DateTimePicker :: positionWidget($widget, position) - "$widget" argument is required');
    }

    $widget.css('top', position.top ? position.top : 'auto');
    $widget.css('right', position.right ? position.right : 'auto');
    $widget.css('bottom', position.bottom ? position.bottom : 'auto');
    $widget.css('left', position.left ? position.left : 'auto');
  },

  _buildHTML: function _buildHTML(element) {
    if (!element) {
      throw new Error('DateTimePicker :: _buildHTML(element) - "element" argument is required');
    }

    this._calendarIcon = $('<span class="fa fa-calendar form-control-feedback"></span>');

    /** To provide a proper work of handson table functionality (user ability to close active cell editor in particular)
     * it requires some active field in the cell with active editor. But datepicker input field looses the focus after the
     * datepicker popover was closed. So this fake input is aimed to keep focus in active datepicker cell editor while the
     * real datepicker input field is blurred **/
    this.focuser = $('<input type="text" class="datepicker-focuser" />');

    this._calendarIcon.on('mousedown', this._onMouseDown.bind(this));

    $(element)
      .wrap('<div class="mm-datetimepicker"></div>')
      .parent()
      .append(this._calendarIcon.add(this.focuser));
  },

  _buildOpenButton: function _buildOpenButton() {
    var buttonText = this.settings.additionalButtons.infiniteEndDate.name;
    var $button = $('<tr><td><a title="Set open date" class="open-date-btn"><span class="open-date-btn__text">' + buttonText + '</span></a></td></tr>');

    $button.on('click', function(event) {
      event.preventDefault();
      this.setDate(this.settings.additionalButtons.infiniteEndDate.value);
      this.hide();
    }.bind(this));

    return $button;
  },

  _calculateWidgetPosition: function _calculateWidgetPosition($widget) {
    if (!$widget) {
      throw new Error('DateTimePicker :: _calculateWidgetPosition($widget) - "$widget" argument is required');
    }

    var shouldPositionOnTop = (this.$element.offset().top >= (window.outerHeight / 2));
    var position = {
      top: this.$element.offset().top + this.$element.height(),
      left: this.$element.offset().left,
      bottom: 'auto',
      right: 'auto'
    };

    if (shouldPositionOnTop) {
      position.top = this.$element.offset().top - $widget.height() - (this.$element.height() / 2);
    }

    return position;
  },

  _onHide: function _onHide() {
    this.$element.off('keydown', this.bound_onKeyDown);
    /**
     * To handle the case where datetimepicker stops the enter key from propagating
     * therefore preventing inlineEdit to update on enter key.
     */
    this.settings.allowPropagateEnter ? this.$element.off('keyup') : this.$element.off('keyup', this.bound_onKeyUp);
    this.$element.off('dp.hide');

    $('body').off('click.popupActive mousedown.popupActive mouseup.popupActive');
    this.focuser.focus();
  },

  _onKeyDown: function(event) {
    /**
     * On key down event, the bootstrap-datetimepicker loses focus.
     * Intentionally bring the input element back to focus.
     */
    if (event.keyCode === 27 || event.keyCode === 13) {
      this.$element.focus();
    }
    this.$element.on('keyup', this.bound_onKeyUp);
  },

  _onKeyUp: function(event) {
    if ($('.bootstrap-datetimepicker-widget').length && event.keyCode === 27) {
      event.stopPropagation();
      this.hide();
    }
    /**
     * To close bootstrap-datetimepicker popup when enter key is pressed.
     */
    if (event.keyCode === 13) {
      this.hide();
    }
  },

  _onMouseDown: function(event) {
    event.preventDefault();
    this.$element.data('DateTimePicker').toggle();
  },

  _onShow: function _onShow() {
    var $widget = $('.bootstrap-datetimepicker-widget');

    $('body').on('click.popupActive mousedown.popupActive mouseup.popupActive', function(e) {
      e.stopPropagation();
    });

    if (this.settings.shouldReposition) {
      var position = this._calculateWidgetPosition($widget);
      this.positionWidget($widget, position);
    }

    if (this.settings.additionalButtons && this.settings.additionalButtons.infiniteEndDate) {
      this._renderOpenButton($widget);
    }

    this.$element.on({
      'keydown': this.bound_onKeyDown,
      'dp.hide': this.bound_onHide
    });

    if (this.$element.data('DateTimePicker').showOnFocus === false) {
      this.$element.data('DateTimePicker').showOnFocus = true;
      this.hide();
    }
  },

  _renderOpenButton: function _renderOpenButton($widget) {
    var $openButton = this._buildOpenButton();

    $widget = $widget || $('.bootstrap-datetimepicker-widget');

    if ($widget) {
      $widget.find('.picker-switch .table-condensed tbody').append($openButton);
    }
  }
};

module.exports = DateTimePicker;
