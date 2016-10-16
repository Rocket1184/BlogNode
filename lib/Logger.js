'use strict';

class Logger {
    constructor(prefix) {
        this.prefix = prefix;
    }

    log(params) {
        let dt = new Date();
        console.log(`${this.prefix || ''}${dt.getFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()} ${dt.getUTCHours()}:${dt.getMinutes()}:${dt.getUTCSeconds()} (UTC)`, params);
    }
}

module.exports = {
    Logger: Logger
};