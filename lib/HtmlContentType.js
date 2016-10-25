'use strict';

const tMap = new Map();

tMap.set('aac','audio/aac')
    .set('abw','application/x-abiword')
    .set('arc','application/octet-stream')
    .set('avi','video/x-msvideo')
    .set('azw','application/vnd.amazon.ebook')
    .set('bin','application/octet-stream')
    .set('bz','application/x-bzip')
    .set('bz2','application/x-bzip2')
    .set('csh','application/x-csh')
    .set('css','text/css')
    .set('csv','text/csv')
    .set('doc','application/msword')
    .set('epub','application/epub+zip')
    .set('gif','image/gif')
    .set('htm','text/html')
    .set('html', 'text/html')
    .set('ico','image/x-icon')
    .set('ics','text/calendar')
    .set('jar','application/java-archive')
    .set('jpeg','image/jpeg')
    .set('jpg', 'image/jpeg')
    .set('js','application/js')
    .set('json','application/json')
    .set('mid','audio/midi')
    .set('midi','audio/midi')
    .set('mpeg','video/mpeg')
    .set('mpkg','application/vnd.apple.installer+xml')
    .set('odp','application/vnd.oasis.opendocument.presentation')
    .set('ods','application/vnd.oasis.opendocument.spreadsheet')
    .set('odt','application/vnd.oasis.opendocument.text')
    .set('oga','audio/ogg')
    .set('ogv','video/ogg')
    .set('ogx','application/ogg')
    .set('pdf','application/pdf')
    .set('png', 'image/png')    
    .set('ppt','application/vnd.ms-powerpoint')
    .set('rar','application/x-rar-compressed')
    .set('rtf','application/rtf')
    .set('sh','application/x-sh')
    .set('svg','image/svg+xml')
    .set('swf','application/x-shockwave-flash')
    .set('tar','application/x-tar')
    .set('tif','image/tiff')
    .set('tiff','image/tiff')
    .set('ttf','application/x-font-ttf')
    .set('text', 'text/plain')
    .set('txt', 'text/plain')
    .set('vsd','application/vnd.visio')
    .set('wav','audio/x-wav')
    .set('weba','audio/webm')
    .set('webm','video/webm')
    .set('webp','image/webp')
    .set('woff','application/x-font-woff')
    .set('xhtml','application/xhtml+xml')
    .set('xls','application/vnd.ms-excel')
    .set('xml','application/xml')
    .set('xul','application/vnd.mozilla.xul+xml')
    .set('zip','application/zip')
    .set('7z','application/x-7z-compressed');

/**
 * Get Content-Type by extName. use application/octet-stream by default.
 * 
 * @param {any} extName
 * @returns {string} Content-Type
 */
function get(extName) {
    if (tMap.has(extName)) {
        return tMap.get(extName);
    } else {
        return 'application/octet-stream';
    }
}

module.exports.get = get;