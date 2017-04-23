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
        GET_SAVED_REPORT: '/Reporting/getUserSavedReportList'
    },
    REQUESTS_MONITOR_TIMEOUT: 5
};
