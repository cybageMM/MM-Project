'use strict';

var $ = require('jquery');

/**
 * Sometimes, we need to convert a string contained multiple words to a string
 * that every word is capitalized.
 * These words could be separated by different characters such as space.
 *
 * For example: In contract, we have "minimum guarantee". This should be converted
 * to "Minimum Guarantee".
 *
 * @param {string} arguments[0] - The string need to be converted.
 * @param {boolean} arguments[1] - Whether capitalize every word in the string.
 * There might be some very rare case, that it only need to make the first letter to be upper case.
 * @param {regex} arguments[2] - The regular expression of separator.
 * By default, "space" is the separator
 * */
$.fn.extend($, {
  capitalize: function() {
    if (arguments[1]) {
      var separator = arguments[2] || /\s/;
      var matchedArray = arguments[0].match(separator);

      if (matchedArray) {
        var convertedString = "-" + arguments[0].split(separator).join(matchedArray[0] + "-");
        return $.camelCase(convertedString);
      }
    }
    return $.camelCase("-" + arguments[0]);
  }
});
