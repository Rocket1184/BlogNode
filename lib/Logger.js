'use strict';

/**
 * Log with current DateTime and/or prefix
 * 
 * @class Logger
 */
class Logger {
    /**
     * Creates an instance of Logger.
     * 
     * @param {string} [prefix=''] prefix before each line of message
     * @param {string} [locale='zh-CN'] time locale
     * @param {string} [timeZone='UTC'] timeZone
     * @param {boolean} [hour12=false] Use 12-hour time format
     * 
     * @memberOf Logger
     */
    constructor(prefix = '', locale = 'zh-CN', timeZone = 'UTC', hour12 = false) {
        this.locale = locale;
        this.timeZone = timeZone;
        this.hour12 = hour12;
        this.prefix = prefix;
    }

    /**
     * get formatted time string
     * 
     * @returns {string} formatted current time
     * 
     * @memberOf Logger
     */
    localeTime() {
        return (new Date()).toLocaleString(
            this.locale, {
                timeZone: this.timeZone,
                hour12: this.hour12
            }
        );
    }

    /**
     * do some logging
     * 
     * @param {any} params params to log
     * 
     * @memberOf Logger
     */
    log(...params) {
        console.log(this.localeTime(), this.prefix, ...params);
    }
}

module.exports = {
    Logger: Logger
};