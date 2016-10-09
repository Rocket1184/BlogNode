'use strict';

const fs = require('fs');
const EventEmitter = require('events');

const InitStatus = new EventEmitter();
let options;
let config;
let inited = false;

/**
 * init module by given config path
 * you cant use get() before init
 * 
 * @param {string} path
 */
function init(path) {
    inited = true;
    fs.readFile(path, (err, data) => {
        try {
            config = JSON.parse(data.toString())[`httpsOptions`];
        } catch (err) {
            return console.log(`[HttpsOption] Https options config not specified.`);
        }
        let done = 0,
            total = Object.getOwnPropertyNames(config).length;
        for (let key in config) {
            fs.readFile(config[key], (err, data) => {
                if (!options) options = {};
                done++;
                if (err) return console.warn(`[HttpsOption] Invalid https config "${key}".`);
                options[key] = data.toString();
                if (done == total) InitStatus.emit('finish', options);
            });
        }
    });
}

/**
 * get httpsOptions and callback
 * callback(err, opt)
 * 
 * @param {function} callback callback(err, opt)
 */
function get(callback) {
    if (!inited) return callback(new Error('Https options haven\'t been inited yet.'));
    InitStatus.on('finish', opt => {
        if (!opt) return callback(new Error('Https options config file invalid.'));
        callback(undefined, opt);
    });
}

module.exports = {
    init: init,
    get: get
};