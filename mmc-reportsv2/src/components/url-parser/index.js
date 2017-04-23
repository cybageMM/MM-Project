
/**
 * Get the path of a URL string.
 */

'use strict';

module.exports = function(url) {
  if (!url) {
    return '';
  }

  if (!/^http/.test(url)) {
    throw new Error('Whoops, your URL is missing a protocol');
  }

  // Parse out the optional query params syntax that sometimes shows up.
  url = url.replace(/\{(.*?)\}/, '');

  var parser = document.createElement('a');
  parser.href = url;

  var pathname = parser.pathname;
  if (pathname.charAt(0) !== '/') {
    pathname = '/' + pathname;
  }

  return pathname;
};

