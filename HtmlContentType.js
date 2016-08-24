'use strict';

const typeMap = new Map();

typeMap.set('html','text/html');
typeMap.set('css','text/css');
typeMap.set('js','application/x-javascript');
typeMap.set('json','application/json');
typeMap.set('jpg','image/jpeg');
typeMap.set('png','image/png');
typeMap.set('txt','text/plain');

function get(extName) {
    if (typeMap.has(extName)) {
        return typeMap.get(extName);
    } else {
        return 'text/plain';
    }
}

module.exports = {
    get: get
}