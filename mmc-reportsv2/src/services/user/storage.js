'use strict';

var UserCollection = require('../../entities/user-collection');
var UserModel = require('../../entities/user-model');
var _ = require('underscore');
var Storage = require('backbone.storage');
var $ = require('jquery');

var UserStorage = Storage.extend({
  model: UserModel,
  collection: UserCollection,
  
  getCurrentUser: function() {
    var _this = this;
    var User = this.model;

    // If there is no cached user, create a user and fetch.
    // Cache the user request too.
    if (!this.user) {
      this.user = new User();
      //this.user.url = '/dist/response/userDetail';
      this.userReq = this.user.fetch();
    }
    return Promise.resolve(this.userReq);  
  }
  
});

module.exports = new UserStorage();
