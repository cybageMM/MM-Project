'use strict';
var _ = require('underscore');
var $ = require('jquery');
var LoadingIndicator = require('application/loading-indicator');
var Service = require('backbone.service');
var Constants = require('application/constants');
var SessionTimer = require('../session-timer/service');
var AlertsService = require('../alerts/service');
var Bootbox = require('bootbox');

/**
 * Service tracks pending requests and manages related services
 * such as loading-indicator or session-timer modal
 */
var PendingRequestsService = Service.extend({

  timerId: null,

  /**
   * Array contains all pending requests. Feature about it: when a new page is opened,
   * the array may become empty several times before the page will be fully loaded.
   * When a request is sent, the global ajax event handler "ajaxSend" is called, unique requestId is generated
   * and the request is put in pendingRequestUrls array.
   * When request is completed, the global ajax event handler "ajaxComplete" is called
   * and the request is removed from pendingRequestUrls.
   */
  pendingRequests: [],

  setup: function() {
    var _this = this;
    var generateRequestId = _this._idGenerator();

    SessionTimer.setup({
      sessionLengthInMinutes: 60,
      onSessionTimeout: function() {
        var confirmationIntervalID;
        var confirmationTimeoutID = setTimeout(function() {
          if (SessionTimer.isActive()) {
            SessionTimer.sync();
            AlertsService.request('close');
          } else {
            SessionTimer.kill();
            var logoutUrl = window.location.origin + window.location.pathname + '#logout';
            window.location.replace(logoutUrl);
            Bootbox.hideAll();
          }
          clearTimeout(confirmationTimeoutID);
          clearInterval(confirmationIntervalID);
        }, 60000);

        if (SessionTimer.isActive()) {
          SessionTimer.sync();
          clearTimeout(confirmationTimeoutID);
          if (confirmationIntervalID) {
            clearInterval(confirmationIntervalID);
          }
        } else {
          AlertsService.request('confirm', {
            title: 'Session Timeout',
            text: 'Your current session is about to timeout in <span id="session-timeout-answer-timer">60</span> seconds. Click "Stay" to continue working or "Log out" to end your session now.',
            confirmLabel: 'Stay',
            className: 'confirm-modal__session',
            backdropClassName: 'modal-backdrop__session',
            onEscape: function() {
              return false;
            },
            closeButton: false,
            confirm: function() {
              clearTimeout(confirmationTimeoutID);
              clearInterval(confirmationIntervalID);
            },
            cancelLabel: 'Log out',
            cancel: function() {
              SessionTimer.kill();
              clearTimeout(confirmationTimeoutID);
              clearInterval(confirmationIntervalID);
              var logoutUrl = window.location.origin + window.location.pathname + '#logout';
              window.location.replace(logoutUrl);
              Bootbox.hideAll();
            }
          });

          var timeRemaining = 60;
          confirmationIntervalID = setInterval(function() {
            if (timeRemaining >= 0) {
              $('#session-timeout-answer-timer').text(timeRemaining -= 1);
            }
          }, 1000);
        }
      }
    });

    // global jquery event called before an ajax request is sent
    $(document).ajaxSend(function(event, xhr, options) {
      var request = {};
      var requestId = generateRequestId();
      request.url = options.url;
      request.xhr = xhr;
      request.xhr.requestId = requestId;

      _this._startTimerIfNotExist();

      LoadingIndicator.showSpinner();
      _this.pendingRequests.push(request);

      SessionTimer.start();
    }).ajaxComplete(function(event, xhr) {
      _this._removeRequestById(xhr.requestId);

      if (_this.pendingRequests.length === 0) {
        _this._stopTimerIfExist();
      }

      //  to avoid blinking for loading indicator so "hiding spinner" is a postponed operation
      setTimeout(function() {
        if (_this.pendingRequests.length === 0) {
          LoadingIndicator.hideSpinner();
        }
      }, 300);
    });
  },

  /**
   * PLTE-1895: timer should catch "hanging requests" - completed but for which "ajaxComplete" has not been called -
   * remove them from pendingRequests and stop loading indicator if pendingRequests becomes empty.
   * Not being called "ajaxComplete" means that an error happened between the time
   * when request has been sent and "ajaxComplete" (request was completed)
   */
  startTimer: function() {
    var _this = this;

    return setInterval(function() {
      _this._handleHangingRequests();

      if (_this.pendingRequests.length === 0) {
        LoadingIndicator.hideSpinner();
        _this._stopTimerIfExist();
      }
    }, Constants.REQUESTS_MONITOR_TIMEOUT * 1000);
  },

  _startTimerIfNotExist: function() {
    if (!this.timerId) {
      this.timerId = this.startTimer();
    }
  },

  _stopTimerIfExist: function() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  _removeRequestById: function(id) {
    var _this = this;
    _this.pendingRequests = _.without(_this.pendingRequests, _.find(_this.pendingRequests, function(req) {
        return req.xhr && req.xhr.requestId === id;
      }
    ));
  },

  /**
   * Looking for all hanging requests: completed (readyState === 4) but for which "ajaxComplete" has not been called.
   * (otherwise they would have been removed from "pendingRequests" array).
   * Manually removing such requests from "pendingRequests" with this timer
   */
  _handleHangingRequests: function() {
    var _this = this;

    _this.pendingRequests = _.filter(_this.pendingRequests, function(req) {
      if (req.xhr && req.xhr.readyState === 4) {
        console.log('The spinner was forcibly stopped! Request %s has been in \"done\" status for more than %d seconds. Potential exception in the code!',
          req.url,
          Constants.REQUESTS_MONITOR_TIMEOUT
        );
        return false;
      }
      return true;
    });
  },

  _idGenerator: function() {
    var id = 1;
    return function() {
      return id++;
    };
  }
});

module.exports = new PendingRequestsService();

