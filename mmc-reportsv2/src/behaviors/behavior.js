'use strict';

var Behavior = require('backbone.marionette').Behavior;
var Syphon = require('backbone.syphon');
var $ = require('jquery');
var _ = require('underscore');
var ChangeSubmitStateBehavior = require('./change-submit-state-behavior');

var errorTooltipTpl = '<div class="tooltip tooltip-error" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>';
var unsavedTooltipTpl = '<div class="tooltip tooltip-unsaved" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>';

module.exports = Behavior.extend({
  behaviors: {
    changeSubmitState: {
      behaviorClass: ChangeSubmitStateBehavior
    }
  },
  initialize: function() {
    // For reference, this is how you listen to model changes.
    // this.listenTo(this.view.options.model, 'all', this.onChange);

    this.tooltips = [];

    this._fixSelect2Enter();
    this._fixDatepickerEscape();
  },

  ui: {
    editInputs: 'input.form-control, textarea.form-control, select.form-control, input[type="checkbox"]',
    submitBtn: ':submit'
  },

  events: {
    'blur @ui.editInputs': 'handleBlur',
    'input @ui.editInputs': 'handleInput',
    'edit:done': 'compositeComponentStateSaved',
    'submit form': 'handleSubmit'
  },

  compositeComponentStateSaved: function(event) {
    var $el = $(event.target);
    var $container = $el.closest('.form-group');
    $container.removeClass('has-unsaved');
    if (arguments.length > 1) {
      this._removeTooltip(Array.prototype.slice.call(arguments, 1));
    }
  },

  handleBlur: function(event) {
    var $eventTarget = $(event.target);
    if ($eventTarget.is('input, textarea') && !$eventTarget.data('select2') && !$eventTarget.data('DateTimePicker')) {
      $eventTarget.val($.trim($eventTarget.val()));
    }
    this._removeTooltip($eventTarget);
  },

  handleInput: function(event) {
    var $eventTarget = $(event.target);
    this._removeTooltip($eventTarget);
  },

  _attachTooltip: function($el, template, message) {
    this.tooltips.push($el);
    $el.tooltip({
      placement: 'bottom',
      animation: false,
      title: message,
      template: template,
      trigger: 'manual'
    });
    $el.tooltip('show');
  },

  _addWarning: function($element, errorMap, key) {
    if ($element.length)  {
      var $container = $element.closest('.form-group');
      // add a red border
      $container.addClass('has-unsaved');
      var $handles = _.isArray(errorMap[key].$handles) ? errorMap[key].$handles : [errorMap[key].$handles];
      _.each($handles, function($handle) {
        this._attachTooltip($handle, unsavedTooltipTpl, errorMap[key].message);
      }.bind(this));
    }
  },

  _addError: function($element, errorMap, key) {
    if ($element.length === 0) {
      // try to see if this is an input from an array.
      // we often do inputs like iter => name = "name", data-number = "0"
      // the error map will then have "name0" as a key.
      var numberPattern = /\d+/g;
      var numbers = key.match(numberPattern);
      if (numbers && numbers.length === 1) {
        $element = this.$('[name=' + key.replace(numbers[0], '') + '][data-number=' + numbers[0] + ']');
      }
    }
    // Hate to do that... But I really need all kinds of "hidden" elements even if they are hidden in such a synthetic way.
    if ($element.is(":hidden") || $element.hasClass("mm-select2-offscreen")) {
      // assume it is select2 or some other plugin that made our default element invisible.
      // In this case need to take its parent.
      // Not most stable thing to do but will do for now.
      $element = $element.parent();
    }

    if ($element.length) {
      // in your template you can define data-error-tooltip-target = ".some-selector" which will be used instead of $element to create tooltip.
      // That is needed in border cases when for example you have a group of inputs but only one error to display
      // Example: if no selection made for the whole group of checkboxes - you can create one single message for one of them and have
      // it define its parents in this attribute so that tooltip can be created for the whole group containing them.
      var $ttEl = $element.data('error-tooltip-target') ? $element.closest($element.data('error-tooltip-target')) : $element;
      this._attachTooltip($ttEl, errorTooltipTpl, errorMap[key]);
      // This is an application wide proposal to add a standalone-form-control css class
      // to all inputs generated in the loops under single label in order for them
      // to be highlighted individually.
      // Before this fix the whole group would be "red"
      $element.closest('.form-group, .standalone-form-control').addClass('has-error');
      $element.closest('.form-group').children('.array-control-label').addClass('has-error');
    }
  },

  _showMessages: function(errorMap, callback) {
    this._clearTooltips();
    _.each(_.keys(errorMap), function(key) {
      var $element =  this.$('[name=' + key + ']:first');
      callback.call(this, $element, errorMap, key);
    }.bind(this));
  },

  onValidationShowInProgressWarnings: function(errorMap) {
    this._showMessages(errorMap, this._addWarning);
  },

  /*
   * @param errorMap: errorMap object from jQuery.validation showError handler
   */
  onValidationShowMessages: function(errorMap) {
    this._showMessages(errorMap, this._addError);
  },

  /**
   * method to clean-up the validation status.
   */
  onValidationHideMessages: function() {
    this._clearTooltips();
  },

  /*
   * Method that actually does removal.
   */
  _detachTooltip: function(i) {
    this.tooltips[i].tooltip('destroy');
    this.tooltips[i].closest('.form-group, .standalone-form-control').removeClass('has-error');
    if (this.tooltips[i].closest('.form-group').find(".standalone-form-control.has-error").length === 0) {
      this.tooltips[i].closest('.form-group').children('.array-control-label').removeClass('has-error');
    }
    this.tooltips[i] = null;
    this.tooltips.splice(i, 1);
  },

  /*
   * Method to remove tooltip from specific element
   *
   */
  _removeTooltip: function($el) {
    var $elements = _.isArray($el) ? $el : [$el];
    _.each($elements, function($el) {
      for (var i = 0; i < this.tooltips.length; i++) {
        if ($el[0] === this.tooltips[i][0] || $el.closest(this.tooltips[i]).length) {
          this._detachTooltip(i);
        }
      }
    }.bind(this));
  },

  /*
   * Method to destroy tooltips. Should be called in a few cases:
   * 1) before render - to destroy tooltips properly
   * 2) before view destroy - same
   * 3) every time show messages method is called to destroy old ones before showing new ones.
   * 4) handleSubmit - as we have no idea whether the view going to be rendered or destroyed or not as a result of that submit
   *    what we know - messages are not relevant anymore.
   * We should not assume that handleSubmit called always so we can skip #3 - sometimes submit happens outside of the
   * view this behavior is attached to. And this behavior is just used to display the validation results properly in this case.
   */
  _clearTooltips: function() {
    if (this.tooltips && this.tooltips.length) {
      var length = this.tooltips.length - 1;
      for (var i = length; i >= 0; i--) {
        this._detachTooltip(i);
      }
    }
  },

  handleSubmit: function(event) {
    this._clearTooltips();
    event.preventDefault(); // Don't want to submit the form!
    this.onSerialize();
  },

  /**
   * Save form inputs on the view's `form` attribute.
   *
   * NOTE: This method can be called via `this.triggerMethod('serialize')`.
   */
  onSerialize: function() {
    // console.log('forms :: onSerialize()', this.view.form);
    this.view.form = Syphon.serialize(this);
  },

  /**
   * Please see the docs:
   * https://github.com/marionettejs/backbone.syphon#basic-usage--deserialize
   *
   * NOTE: This method can be called via `this.triggerMethod('deserialize')`.
   */
  onDeserialize: function() {
    // console.log('forms :: deserialize()');
    return Syphon.deserialize(this, this.view.form);
  },

  /**
   * Before interpolating our template with data, check to see if we've
   * serialized the form before. If we have, then serialize the form again.
   *
   * This method has the effect of allowing you to keep your form inputs around
   * should you need to re-render them again.
   */
  onBeforeRender: function() {
    // console.log('forms :: onBeforeRender()', this.view.form);
    this._clearTooltips();
    if (this.view.form) {
      this.onSerialize();
    }
  },

  /**
   * Clean up events, etc
   */
  onBeforeDestroy: function() {
    this._clearTooltips();
  },

  /**
   * Please see the docs:
   * http://marionettejs.com/docs/v2.4.2/marionette.view.html#view-domrefresh--ondomrefresh-event
   */
  onDomRefresh: function() {
    // console.log('forms :: onDomRefresh()', this.view.form);

    // Fill in your form inputs.
    if (this.view.form) {
      this.onDeserialize();
    }
  },

  /*
   * @param xhr
   * @param fieldsNameMap Optional: An object having the references as map for the field names, this is required
   * to display a correct label in the validations. for example:
   * {
   *    'startDate': 'Start Date'
   * }
   */
  /**
   * Method should be called when response.status = 400 gets xhr object.
   * In that case we have predefined format of response object, we parse it and then
   * call onValidationShowMessages to have Error Messages displayed
   * @param  {xhr} xhr
   * @param  {Object} fieldsNameMap
   * @return {String}
   */
  onValidationShowMessagesFromServices: function(xhr, fieldsNameMap) {
    var _this = this;
    var errorsArr = JSON.parse(xhr.responseText).errors;
    var errors = {};
    var errorProperty;
    // Create a method that replace the Display Name.
    var replaceMessage = function(property, message) {
      if (message && fieldsNameMap && fieldsNameMap[property]) {
        return String(message).replace('{0}', fieldsNameMap[property]);
      }
      return message;
    };

    if (errorsArr) {
      for (var i = 0; i < errorsArr.length; i++) {
        if (errorsArr[i].property) {
          errorProperty = errorsArr[i].property;
          if (!errors.hasOwnProperty(errorProperty)) {
            errors[errorProperty] = replaceMessage(errorProperty, errorsArr[i].message);
          }
        } else if (_.isArray(errorsArr[i].properties)) {
          for (var j = 0; j < errorsArr[i].properties.length; j++) {
            errorProperty = errorsArr[i].properties[j];
            if (!errors.hasOwnProperty(errorProperty)) {
              errors[errorProperty] = replaceMessage(errorProperty, errorsArr[i].message);
            }
          }
        }
      }
    }
    _this.onValidationShowMessages(errors);
  },

  _fixSelect2Enter: function() {
    var _this = this;
    var fixSelect2Enter = function(e) {
      if (e.keyCode === $.ui.keyCode.ENTER && _this.ui.submitBtn.is(':enabled')) {
        $(e.currentTarget).closest('form').trigger('submit');
      }
    };

    this.on('show', function() {
      _this.$('.mm-select2-form input.select2-focusser').on('keydown', fixSelect2Enter);
    });

    this.on('destroy', function() {
      _this.$('.mm-select2-form input.select2-focusser').off('keydown', fixSelect2Enter);
    });
  },

  _fixDatepickerEscape: function() {
    var _this = this;
    var fixDatepickerEscape = function(e) {
      if (e.keyCode === $.ui.keyCode.ESCAPE && $('.datepicker').length) {
        $(this).datepicker('hide');
      }
    };

    this.on('show', function() {
      _this.$('.mm-datepicker input').on('keydown', fixDatepickerEscape);
    });

    this.on('destroy', function() {
      _this.$('.mm-datepicker input').off('keydown', fixDatepickerEscape);
    });
  }
});
