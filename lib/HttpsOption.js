'use strict';

const fs = require('fs');
const EventEmitter = require('events');

const InitStatus = new EventEmitter();
let options, config, inited = false;


function init(path) {
    inited = true;
    fs.readFile(path, (err, data) => {
        config = JSON.parse(data.toString())[`httpsOptions`];
        if (!config) return console.log(`[HttpsOption] Https options config not specified.`)
        let done = 0,
            total = Object.getOwnPropertyNames(config).length;
        for (let key in config) {
            fs.readFile(config[key], (err, data) => {
                done++;
                if (err) return console.warn(`[HttpsOption] Invalid https config "${key}".`);
                options[key] = data.toString();
                if (done == total) InitStatus.emit('finish', options);
            });
        }
    });
}

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
}