'use strict';

/**
 * get parsed config Object in callback
 * 
 * @param {String} path
 * @param {Function} callback
 */
function getConfig(filePath, callback) {
    let config;
    try {
        config = require(filePath);
        callback && callback(null, config);
    } catch (err) {
        callback(err, null);
    }
}

module.exports = {
    get: getConfig
};