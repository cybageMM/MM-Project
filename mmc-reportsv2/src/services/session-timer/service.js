'use strict';

var SessionTimer = (function SessionTimer() {
  var api = {
    setup: setup,
    getSessionLength: getSessionLength,
    isActive: isActive,
    start: start,
    kill: kill,
    sync: sync
  };

  var _sessionLength = 30;
  var _sessionTimerID;
  var _sessionVariable = '__mmsv__';
  var _nextTimeoutTimestamp;
  var _onSessionTimeoutCallback = function() {
    console.log('user session expired');
  };

  function setup(params) {
    if (params) {
      if (params.sessionLengthInMinutes &&
        (typeof params.sessionLengthInMinutes !== 'number' || params.sessionLengthInMinutes <= 0)) {
        throw new Error('Invalid argument: "sessionLengthInMinutes" should be a non-negative number');
      }

      if (params.onSessionTimeout && typeof params.onSessionTimeout !== 'function') {
        throw new Error('Invalid argument: "onSessionTimeout" should be a function');
      }

      _setSessionLength(params.sessionLengthInMinutes ? params.sessionLengthInMinutes : _sessionLength);
      _onSessionTimeoutCallback = params.onSessionTimeout ? params.onSessionTimeout : _onSessionTimeoutCallback;
    }
  }

  function getSessionLength() {
    return _sessionLength;
  }

  function isActive() {
    return _sessionVariableExists() && _getSessionVariable() > Date.now();
  }

  function kill() {
    if (_sessionTimerID) {
      clearTimeout(_sessionTimerID);
    }
    _removeSessionVariableFromLocalStorage(_sessionVariable);
  }

  function start() {
    _clearTimeout(_sessionTimerID);
    _setNextTimeoutTimestamp(Date.now() + (getSessionLength() * 60000));
    _setSessionVariableToLocalStorage(_sessionVariable, _nextTimeoutTimestamp);
    _startTimer(getSessionLength() * 60000);
  }

  function sync() {
    _clearTimeout(_sessionTimerID);
    _startTimer(_getSessionVariable() - Date.now());
  }

  function _clearTimeout(timerID) {
    if (timerID) {
      clearTimeout(timerID);
    }
  }

  function _getSessionVariable() {
    return window.localStorage && window.localStorage.getItem(_sessionVariable) ? parseInt(window.localStorage.getItem(_sessionVariable), 10) : null;
  }

  function _startTimer(timeout) {
    _sessionTimerID = setTimeout(_onSessionTimeout, timeout);
  }

  function _sessionVariableExists() {
    return window.localStorage && window.localStorage.getItem(_sessionVariable);
  }

  function _setNextTimeoutTimestamp(nextTimeout) {
    _nextTimeoutTimestamp = nextTimeout;
  }

  function _removeSessionVariableFromLocalStorage(sessionVariable) {
    if (window && window.localStorage && window.localStorage.getItem(sessionVariable)) {
      window.localStorage.removeItem(sessionVariable);
    }
  }

  function _setSessionVariableToLocalStorage(sessionVariable, expires) {
    if (window && window.localStorage) {
      window.localStorage.setItem(sessionVariable, expires);
    }
  }

  function _setSessionLength(sessionLength) {
    _sessionLength = sessionLength;
  }

  function _onSessionTimeout() {
    _onSessionTimeoutCallback();
  }

  return api;
})();

module.exports = SessionTimer;
