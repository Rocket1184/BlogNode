'use strict';

const ContentType = require('./HtmlContentType');

/**
 * Init builder with expire time
 * 
 * @param {number} eTime expire time
 */
function init(eTime) {
    this.eTime = eTime;
}

/**
 * build response header object via extName and fs Stats
 * 
 * @param {string} extName
 * @param {object} stats [optional] Class: fs.Stats
 * @param {string} otherOptions [optional] 'no-cache', 'no-length'
 * @returns Object contains response headers
 */
function buildHeader(extName, ...otherOptions) {
    let stats = otherOptions[0];
    let res = {};
    res['Content-Type'] = ContentType.get(extName);
    if (otherOptions.indexOf('no-cache')) {
        res['Cache-Control'] = 'no-cache';
    } else {
        res['Cache-Control'] = `max-age=${this.eTime || 31536000}`;
        res['Expires'] = new Date(Date.now() + (this.eTime || 31536000)).toUTCString();
    }
    if (typeof stats == 'object') {
        res['Last-Modified'] = stats.mtime.toUTCString();
        if (otherOptions.indexOf('no-length') < 0) {
            res['Content-Length'] = stats.size;
        }
    }
    return res;
}

module.exports = {
    init: init,
    build: buildHeader
};