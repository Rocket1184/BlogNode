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
 * @param {object} stat Class: fs.Stats
 * @returns Object contains response headers
 */
function buildHeader(extName, stat) {
    let res = {
        'Content-Type': ContentType.get(extName),
        'Cache-Control': `max-age=${this.eTime || 31536000}`,
        'Expires': new Date(Date.now() + (this.eTime || 31536000)).toUTCString(),
    };
    if (stat) {
        res['Last-Modified'] = stat.mtime.toUTCString();
    }
    return res;
}

module.exports = {
    init: init,
    build: buildHeader
};