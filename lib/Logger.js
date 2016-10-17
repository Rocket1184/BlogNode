'use strict';

class Logger {
    constructor(prefix) {
        this.prefix = prefix ? prefix + ' ' : null;
    }

    getTime() {
        let dt = new Date();
        let y = dt.getFullYear();
        let m = dt.getUTCMonth().toString();
        let d = dt.getUTCDate().toString();
        let t = dt.toUTCString().slice(17);
        return `${this.prefix || ''}${y}-${m}-${d} ${t}`;
    }

    log(...params) {
        console.log(this.getTime(), params.join(' '));
    }
}

module.exports = {
    Logger: Logger
};