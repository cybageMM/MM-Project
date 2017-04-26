'use strict';

module.exports = {
	TOKEN_KEY: 'jwtToken',
	SERVICE_URL: {
        URL_LOGIN_API: '/UserPortal/login',
        URL_LOGOUT_API:'/UserPortal/logout',
        URL_GET_USER_API:'/UserPortal/getUser',
        USER_PROFILE: '/UserPortal/manageProfile',
        MANAGE_PASSWORD: '/UserPortal/managePassword',
        RESET_PASSWORD: '/UserPortal/resetPassword',
        FORGOT_PASSWORD: '/UserPortal/forgotPassword',
        CHANGE_PASSWORD: '/UserPortal/changePassword'
    },
    REQUESTS_MONITOR_TIMEOUT: 5,
    PASSWORD_LENGTH: 8,
    SESSION_EXPIRE_TIME: 15,
    SESSION_OUT_TIME_KEY: 'session_out_time',
    BEFORE_LOGIN_ROUTE: ['', 'login', 'password/reset', 'changePassword'],
    CHANGE_PASSWORD_ROUTE_REGEX: /(^(changePassword\/id\/))([0-9A-Za-z]*)(\/pass\/)[0-9A-Za-z]*/,
    API_STATUS_CODES: {
    	SUCCESS: 200
    },

	LOGIN_BASE_URL: 'http://localhost/MMLOGIN/#',
	REPORT_BASE_URL: 'http://localhost/MMPROJECT/'
};
