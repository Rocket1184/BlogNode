'use strict';

const fs = require('fs');
const EventEmitter = require('events');

const InitStatus = new EventEmitter();

/**the parsed config object */
let opt;

/**
 * init global config by given file path
 * 
 * @param {String} path
 */
function init(path) {
    fs.readFile(path, (err, data) => {
        if (err) {
            return console.warn(`[Config] Config file ${path} read failed.`);
        } else {
            try {
                opt = JSON.parse(data.toString());
            } catch (err) {
                throw new Error(`[Config] Config file ${path} parse failed.`);
            } finally {
                InitStatus.emit('finish', opt);
            }
        }
    });
}

/**
 * get parsed config Object in callback
 * 
 * @param {String} path
 * @param {Function} callback
 */
function get(path, callback) {
    init(path);
    InitStatus.on('finish', opt => {
        callback(opt);
    });
}

module.exports = {
    get: get
};