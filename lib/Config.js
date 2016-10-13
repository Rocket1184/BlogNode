'use strict';

const fs = require('fs');
const EventEmitter = require('events');

const InitStatus = new EventEmitter();
const HttpsOption = require('./HttpsOption');

let inited = false;
/**the parsed config object */
let opt;

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
            /**raw json object from config file */
            let json;
            try {
                json = JSON.parse(data.toString());
                opt = {
                    server: {},
                    httpsOptions: {}
                };
                opt.port = json.server.port;
                if (json.server.enableHttps) {
                    opt.server.enableHttps = true;
                    opt.server.httpsPort = json.server.httpsPort;
                    opt.server.redirectHttpToHttps = json.server.redirectHttpToHttps;
                    opt.httpsOptions = json.httpsOptions;
                    HttpsOption.init(opt.httpsOptions, opt.server.httpsPort);
                } else {
                    opt.server.enableHttps = false;
                }
            } catch (err) {
                console.warn(`[Config] Config file ${path} parse failed.`);
            } finally {
                InitStatus.emit('finish', opt);
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
function getGlobalOptions(callback) {
    if (!inited) throw new Error('Config haven\'t been inited yet!');
    InitStatus.on('finish', opt => { callback(opt); });
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