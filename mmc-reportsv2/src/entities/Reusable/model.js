'use strict';

var Backbone = require('backbone');
var Model = require('backbone').Model;

module.exports = Model.extend({
	save: function(attrs, options){
		if(attrs){
			this.set(arrts);
		}
		options = options ? options : {};
		//options.headers = {'JWT-TOKEN' : localStorage.getItem("jwtToken")};
		var xhr = Backbone.sync("create", this, options);
		return xhr;
	}
});