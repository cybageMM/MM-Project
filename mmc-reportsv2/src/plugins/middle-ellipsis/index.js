'use strict';

module.exports = {
  parse: function(str, trailingCharsNum) {
    var length = str.length;
    trailingCharsNum = trailingCharsNum || 8;

    function processString(start, end) {
      return str.substring(start, end).replace(/\s/g, '&nbsp;');
    }

    return '<span class="middle-ellipsis__start">' + processString(0, length - trailingCharsNum) + '</span>' +
      '<span class="middle-ellipsis__end">' + processString(length - trailingCharsNum, length) + '</span>';
  }
};
