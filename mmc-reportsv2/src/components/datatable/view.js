'use strict';

var Marionette = require('backbone.marionette');
var DataTable = require('datatables.net-bs')();

module.exports = Marionette.View.extend({
	renderTable : function(element, dataSet, columns, options) {
		element.DataTable({
		    "language" : {
		        "info" : "Showing _START_-_END_ of _TOTAL_ result(s)",
		        "paginate" : {
		            "first" : "<span aria-hidden='true'>«</span>",
		            "last" : "<span aria-hidden='true'>»</span>",
		            "previous" : "<span aria-hidden='true'>‹</span>",
		            "next" : "<span aria-hidden='true'>›</span>"
		        },
		    },
		    "pagingType" : "full_numbers",
		    "searching" : false,
		    "bLengthChange" : false,
		    data : dataSet,
		    columns : columns
		});
	}
});
