'use strict';

const ArchiveReader = require('./ArchiveReader');

let rawIndex;

function init(indexStr) {
    rawIndex = indexStr;
}

function buildIndex(callback) {
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