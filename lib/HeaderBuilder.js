'use strict';

const ContentType = require('./HtmlContentType');

/**
 * build response header object via extName and fs Stats
 * 
 * @param {string} extName
 * @param {object} otherOptions [optional] { stats: fs.Stats, range: Ranger/true/false, cache:t/f/number, exprire:t/f/number, length:t/f }
 * @returns Object contains response headers
 */
function buildHeader(extName, otherOptions) {
    let res = {};
    res['Content-Type'] = ContentType.get(extName);

    if (!otherOptions) otherOptions = {};

    if (otherOptions.cache === false || !otherOptions.cache) {
        res['Cache-Control'] = 'no-cache';
    } else if (otherOptions.cache === true) {
        res['Cache-Control'] = 'max-age=86400';
    } else if (typeof otherOptions.cache == 'number') {
        res['Cache-Control'] = `max-age=${otherOptions.cache}`;
    }

    if (otherOptions.exprire === true) {
        res['Expires'] = new Date(Date.now() + 31536000).toUTCString();
    } else if (typeof otherOptions.exprire == 'number') {
        res['Expires'] = new Date(Date.now() + (otherOptions.cache)).toUTCString();
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
    build: buildHeader
};