'use strict';

var Service = require('backbone.service');
var Bootbox = require('bootbox');
var ConfirmTemplate = require('./confirm/template.html');
var AlertTemplate = require('./alert/template.html');
var PromptTemplate = require('./prompt/template.html');
var _ = require('underscore');
var $ = require('jquery');


/**
 * @class
 * @classdesc aka AlertService.  Alert, prompt or confirm.
 */
var NotificationService = Service.extend(
  /** @lends NotificationService.prototype */
  {
    requests: {
      'confirm': 'confirm',
      'alert': 'alert',
      'prompt': 'prompt',
      'close': 'close'
    },

    /** @private */
    _callDialog: function(opts) {
      Bootbox.dialog(opts).on('show.bs.modal', function() {
        $('.modal:visible,.modal-backdrop:visible').addClass('mm-auto-hide').hide();
      }).on('shown.bs.modal', function() {
        $('.modal-backdrop:visible').addClass(opts.backdropClassName);
      }).on('hidden.bs.modal', function() {
        var $hiddenModals = $('.modal.mm-auto-hide,.modal-backdrop.mm-auto-hide');
        if ($hiddenModals.length) {
          $hiddenModals.removeClass('mm-auto-hide').show();
          // The closing modal from alert would remove this class from body and will cause the scrollbars from our fixed elements to go away causing PLTE-4485.
          $('body').addClass("modal-open");
        }
      }).modal('show');
    },

    /**
     * Open and alert modal
     * @param  {Object} options
     * @return {undefined}
     */
    alert: function(options) {
      var opts = {
        'title': options.title,
        'className': 'session-modal',
        'message': AlertTemplate({
          text: options.text
        }),
        'show': false,
        'onEscape': true,
        'buttons': {
          'Ok': {
            'className': 'btn-pink',
            'callback': options.confirm
          }
        }
      };
      this._callDialog(opts);
    },
    /**
     * Displays a confirmation message as a Modal using bootbox.js.
     * @param {Object} options The options to display the modal.
     * <ul>
     * <li>title: The Modal Title</li>
     * <li>text: The text to display inside the modal</li>
     * <li>color: The color to use for the image, by default is warning.</li>
     * <li>cancelLabel: The label to use for Cancel.</li>
     * <li>confirmLabel: The label to use for Confirm.</li>
     * <li>cancel: The callback for cancel.</li>
     * <li>confirm: The callback for confirm.</li>
     * </ul>
     * @return {undefined}
     * @example
     * AlertsService.request('confirm', {
     *  title: 'Saved Search is Out of Sync',
     *  text: message,
     *  confirm: function() { // revert
     *    Promise.resolve(this.savedSearch.fetch())
     *      .then(function() {
     *        this.triggerApplySavedSearch(this.savedSearch);
     *      }.bind(this))
     *      .catch(console.error);
     *  }.bind(this),
     *  cancel: this.completeUpdate.bind(this), // override
     *  cancelLabel: 'Override',
     *  confirmLabel: 'Revert'
     * });
     */
    confirm: function(options) {
      var opts = {
        'title': options.title,
        'className': 'session-modal ' + (options.className ? options.className : ''),
        'backdropClassName' : options.backdropClassName,
        'message': ConfirmTemplate({
          text: options.text,
          color: options.color
        }),
        'show': false,
        'onEscape': true,
        'closeButton': true,
        'buttons': {
          'Cancel': {
            'label': options.cancelLabel || 'Cancel',
            'callback': options.cancel
          },
          'Confirm': {
            'label': options.confirmLabel || 'Confirm',
            'className': 'btn-pink',
            'callback': options.confirm
          }
        }
      };
      this._callDialog(opts);
    },

    /**
     * "Ok" or "Cancel"
     * @param  {Object} options
     * @return {undefined}
     */
    prompt: function(options) {
      var opts = {
        'title': options.title,
        'className': 'session-modal',
        'message': PromptTemplate({
          text: options.text
        }),
        'show': false,
        'onEscape': true,
        'buttons': {
          'Cancel': {
            'callback': options.cancel
          },
          'Ok': {
            'className': 'btn-pink',
            'callback': options.confirm
          }
        }
      };
      this._callDialog(opts);
    },

    /**
     * Hide All
     * @return {undefined}
     */
    close: function() {
      Bootbox.hideAll();
    }
  }
);

module.exports = new NotificationService();
