'use strict';

const fs = require('fs');

const HttpsOption = require('./HttpsOption');

let inited = false;
let GlobalOptions;

function init(path) {
    fs.readFile(path, (err, data) => {
        if(err) {
            console.warn(`[Node Server] Config file ${path} read failed.`);
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
                if(optJSON.server.enableHttps) {
                    GlobalOptions.server.enableHttps = true;
                    GlobalOptions.server.httpsPort = optJSON.server.httpsPort;
                    GlobalOptions.httpsOptions = optJSON.httpsOptions;
                    HttpsOption.init(GlobalOptions.httpsOptions);
                } else {
                    GlobalOptions.server.enableHttps = false;
                }
            } catch (err) {
                console.warn(`[Node Server] Config file ${path} parse failed.`);
            }
        }
    });
}

function getHttpsOptions(callback) {
    return HttpsOption.get(callback);
}

module.exports = {
    init: init,
    options: GlobalOptions,
    getHttpsOptions: getHttpsOptions
};