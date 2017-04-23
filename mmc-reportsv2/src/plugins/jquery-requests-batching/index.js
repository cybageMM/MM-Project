'use strict';
var _ = require('underscore');
var $ = require('jquery');
var reflect = require('sub-applications/account-management/add-group-modal/reflect');

/*
 designed to prevent running our of resources when sending thousands of requests.
 usage getDataInBatches(options, payload, 1000), where
 options - $.ajax options,
 payload - array of payload items to be sent,
 1000 - number of requests in a single batch.
 will return promise resolved with all the responses.
 */
module.exports = function(options, payload, batchSize, start, resp) {
  function getData(options, payload, batchSize, start, resp) {
    if (!start) start = 0;
    if (start > payload.length || !payload || payload.length === 0) return null;
    if (!options || !options.url) {
      throw new Error("Please provide url for the requests");
    }
    var opts = {
      type: "POST",
      'contentType': "application/json",
      dataType: "json",
      mmErrorHandled: true
    };
    _.extend(opts, options);
    if (!resp) resp = [];
    var range = _.range(start, start + batchSize <= payload.length - 1 ? start + batchSize : payload.length, 1);
    var reqBatch = _.chain(range).map(function(ind) {
      _.extend(opts, {
        data: JSON.stringify(payload[ind])
      });
      return Promise.resolve($.ajax(opts));
    }).map(reflect).value();
    return Promise.all(reqBatch)
      .then(function(res) {
        if (res !== null) Array.prototype.push.apply(resp, res);
      })
      .then(getData.bind(this, options, payload, batchSize, start + batchSize, resp)).then(function() {
        return resp;
      });
  }
  return getData(options, payload, batchSize, start, resp);
};
