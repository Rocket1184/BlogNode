'use strict';

const fs = require('fs');
const EventEmitter = require('events');

const InitStatus = new EventEmitter();
const HttpsOption = require('./HttpsOption');

let inited = false;
let GlobalOptions = {};

/**
 * init global config by given file path
 * 
 * @param {any} path
 */
function init(path) {
    inited = true;
    fs.readFile(path, (err, data) => {
        if (err) {
            console.warn(`[Config] Config file ${path} read failed.`);
            return;
        } else {
            let optJSON;
            try {
                optJSON = JSON.parse(data.toString());
                GlobalOptions = {
                    server: {},
                    httpsOptions: {}
                };
                GlobalOptions.port = optJSON.server.port;
                if (optJSON.server.enableHttps) {
                    GlobalOptions.server.enableHttps = true;
                    GlobalOptions.server.httpsPort = optJSON.server.httpsPort;
                    GlobalOptions.httpsOptions = optJSON.httpsOptions;
                    HttpsOption.init(GlobalOptions.httpsOptions);
                } else {
                    GlobalOptions.server.enableHttps = false;
                }
            } catch (err) {
                console.warn(`[Config] Config file ${path} parse failed.`);
            } finally {
                InitStatus.emit('finish', GlobalOptions);
            }
        }
    });
}

/**
 * get Object 'GlobalOptions', contains server ports, enableHttps and so on...
 * DO NOT use this before init module.
 * 
 * @returns
 */
function getGlobalOptions() {
    if (!inited) throw new Error('Config haven\'t been inited yet!');
    return GlobalOptions;
}

/**
 * get full https options for create https server.
 * DO NOT use this before init module.
 * 
 * @param {any} callback
 * @returns
 */
function getHttpsOptions(callback) {
    if (!inited) return callback(new Error('Config haven\'t been inited yet!'));
    InitStatus.on('finish', opt => {
        if (!opt.server.enableHttps) callback(new Error('HTTPS not enabled in config.json'));
        return HttpsOption.get(callback);
    });
}

module.exports = {
    init: init,
    getGlobalOptions: getGlobalOptions,
    getHttpsOptions: getHttpsOptions
};