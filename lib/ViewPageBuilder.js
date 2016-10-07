'use strict';

const fs = require('fs');

const ArchiveReader = require('./ArchiveReader');
const MarkdownParser = require('./MarkdownParser');

let plainViewPage;
let inited = false;
let regexs = {
    arcitleTitle: /\$\{article\.title\}/,
    articleContent: /\$\{article\.content\}/
};

function init(plain) {
    plainViewPage = plain;
    inited = true;
}

/**
 * build view page html string from specificed file path
 * 
 * @param {String} filePath
 * @param {any} callback
 * @returns {String} if callback undefined, returns page string
 */
function buildViewPage(filePath, callback) {
    if (!inited) throw new Error('Module ViewPageBuilder haven\'t been inited');
    fs.readFile(filePath, (err, data) => {
        if (err) throw new Error('No such archive.');
        let str = data.toString();
        let archive = ArchiveReader.parse(filePath, str);
        let page = plainViewPage;
        page = page.replace(regexs.arcitleTitle, archive.title);
        page = page.replace(regexs.articleContent, MarkdownParser.toHtml(archive.content));
        if (callback) return callback(page);
        else return page;
    });
}

module.exports = {
    init: init,
    build: buildViewPage
};