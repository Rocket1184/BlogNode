'use strict';

const tMap = new Map();

tMap.set('html', 'text/html')
    .set('css', 'text/css')
    .set('js', 'application/x-javascript')
    .set('json', 'application/json')
    .set('jpg', 'image/jpeg')
    .set('png', 'image/png')
    .set('gif', 'image/gif')
    .set('ico', 'image/x-icon')
    .set('txt', 'text/plain');

function get(extName) {
    if (tMap.has(extName)) {
        return tMap.get(extName);
    } else {
        return 'text/plain';
    }
}

module.exports = {
    get: get
}