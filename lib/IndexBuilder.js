'use strict';

const ArchiveReader = require('./ArchiveReader');

let inited = false;
let rawIndex;

/**
 * init IndexBuilder using raw index page
 * 
 * @param {string} indexStr
 */
function init(indexStr) {
    inited = true;
    rawIndex = indexStr;
}

/**
 * build index page from ArchiveReader.
 * MUST invoke after init.
 * 
 * @param {any} callback
 */
function buildIndex(callback) {
    if(!inited) throw new Error('IndexBuilder not inited yet.');
    ArchiveReader.getSummaryList(archiveList => {
        let archiveListHTML = new Array();
        let len = archiveList.length;
        for (let i = 0; i < len; i++) {
            let archive = archiveList[i];
            archiveListHTML.push(archive.getHTML());
        }
        callback(rawIndex.replace('<!--${archiveList}-->', archiveListHTML.join('')));
    });
}

module.exports = {
    init: init,
    build: buildIndex
};