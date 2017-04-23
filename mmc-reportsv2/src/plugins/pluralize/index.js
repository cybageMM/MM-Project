'use strict';

var pluralize = require('pluralize');
var _ = require('underscore');

/**
 * In the utils section of master config, there is section called "pluralMapping" which
 * is used for defining some special rule of pluralize.
 * For example:
 * singular : plural
 * -----------------
 * was      : were
 * minimum guarantee : minimum guarantees
 * */
module.exports = {
  setup: function(config) {
    var utils = config.get('utils');
    if (!utils || !utils['pluralMapping']) {
      console.error('The special rule of pluralize is not set because no special rule exists!');
      return;
    }

    var mappings = utils['pluralMapping'];

    _.each(mappings, function(plural, singular) {
      pluralize.addSingularRule(singular, singular);
      pluralize.addPluralRule(singular, plural);
    });
  }
};
