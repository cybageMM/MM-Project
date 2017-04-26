'use strict';

var _ = require('underscore');

var createIcons = function (data,row) {
	var iconString ='';
	if(data.icons) {
		var icons = data.icons;
		_.each(icons, function (icon) {
			iconString += icon.isLink ? '<a href="javascripr:;" rowId="'+ row.reportId +'" class="' + icon.linkClass + '"><i class="fa ' + icon.icon + ' ' + icon["icon-class"] + '" aria-hidden="true"></i></a>&nbsp;' : 
				'<i class="fa ' + icon.icon + ' ' + icon["icon-class"] + '" aria-hidden="true"></i>&nbsp;';
		});
	}
	return iconString;
}

module.exports = {
    actionIconRenderer: function (data, type, row, meta) {
    	return createIcons(data, row);
    },
	linkRenderer: function (data, type, row, meta) {
		return '<a href="">' + data + '</a>';
	},
	linkWithIconRenderer : function (data, type, row, meta) {
		var icons = createIcons(data, row);
		return icons + '&nbsp;<a href="">' + data.data + '</a>';
	}
};
