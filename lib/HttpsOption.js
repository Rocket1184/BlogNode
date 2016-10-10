'use strict';

const fs = require('fs');
const EventEmitter = require('events');

const InitStatus = new EventEmitter();
let options;

/**
 * init module by given config object
 * you cant use get() before init
 * 
 * @param {Object} path
 */
function init(config) {
    let done = 0;
    let total = Object.getOwnPropertyNames(config).length;
    for (let key in config) {
        fs.readFile(config[key], (err, data) => {
            if (!options) options = {};
            done++;
            if (err) return console.warn(`[HttpsOption] Invalid https config "${key}".`);
            options[key] = data.toString();
            if (done == total) InitStatus.emit('finish', options);
        });
    }
}

/**
 * get httpsOptions and callback
 * callback(err, opt)
 * 
 * @param {function} callback callback(err, opt)
 */
function get(callback) {
    InitStatus.on('finish', opt => {
        if (!opt) return callback(new Error('Https options config file invalid.'));
        callback(undefined, opt);
    });
}

module.exports = {
    init: init,
    get: get
};