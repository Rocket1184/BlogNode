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

function buildHeader(extName, stat) {
    let res = {
        'Content-Type': ContentType.get(extName),
        'Cache-Control': `max-age=${this.eTime || 31536000}`,
        'Expires': new Date(Date.now() + (this.eTime || 31536000)).toUTCString(),
    };
    if (stat) {
        res['Content-Length'] = stat.size || 0;
        res['Last-Modified'] = stat.mtime.toUTCString();
    }
    return res;
}

module.exports = {
    init: init,
    build: buildHeader
};