'use strict';

const fs = require('fs');

let options, config, inited = false;

function init(path) {
    inited = true;
    fs.readFile(path, (err, data) => {
        config = JSON.parse(data.toString())[`httpsOptions`];
        if (!config) return console.log(`[HttpsOption] Https options config not specified.`)
        for (let key in config) {
            fs.readFile(config[key], (err, data) => {
                if (err) return console.warn(`[HttpsOption] Invalid https config "${key}".`);
                options[key] = data.toString();
            });
        }
    });
}

function get(callback) {
    if (!inited) return callback(new Error('Https options haven\'t been inited yet.'));
    if (!options) return callback(new Error('Https options config file invalid.'));
    return callback(undefined, options);
}

module.exports = {
    init: init,
    get: get
}