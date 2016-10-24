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
 * @param {object} otherOptions [optional] { stats: fs.Stats, range: Ranger/true/false, cache:t/f, length:t/f }
 * @returns Object contains response headers
 */
function buildHeader(extName, otherOptions) {
    let res = {};
    res['Content-Type'] = ContentType.get(extName);

    if (!otherOptions) otherOptions = {};

    if (otherOptions.cache === false) {
        res['Cache-Control'] = 'no-cache';
    } else {
        res['Cache-Control'] = `max-age=${this.eTime || 31536000}`;
        res['Expires'] = new Date(Date.now() + (this.eTime || 31536000)).toUTCString();
    }

    if (typeof otherOptions.stats === 'object') {
        res['Last-Modified'] = otherOptions.stats.mtime.toUTCString();
        if (otherOptions.length !== false) {
            res['Content-Length'] = otherOptions.stats.size;
        }
    }

    if (otherOptions.range !== false) {
        res['Accept-Ranges'] = 'bytes';
    }

    if (typeof otherOptions.range === 'object') {
        res['Content-Range'] = 'bytes ' + otherOptions.range.headerRange;
        res['Content-Length'] = otherOptions.range.size();
    }

    return res;
}

module.exports = {
    init: init,
    build: buildHeader
};