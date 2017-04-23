'use strict';

module.exports = {
	
	deleteIconRenderer : function(data, type, row, meta ) {
		if ( type === 'display' ) {
            return ' <i class="fa fa-lock" aria-hidden="true"/>';
        }
        return data;
    },
    actionIconRendere: function (data, type, row, meta) {
    	//if ( type === 'display' ) {
    		return '<i class="fa fa-clock-o schedule-icon" aria-hidden="true"></i>&nbsp;' + 
    		'<i class="fa fa-trash-o delete-icon" aria-hidden="true"></i>';
    	//}
    }
};
