'use strict';

const fs = require('fs');

const ArchiveReader = require('./ArchiveReader');

let plainViewPage;
let inited = false;
let regexs = {
    arcitleTitle: /\$\{article\.title\}/g,
    articleContent: /\$\{article\.content\}/g,
    articleFilename: /\$\{article\.filename\}/g
};

/**
 * init the module by plain view page;
 * you cant use build() before init.
 * 
 * @param {string} plain
 */
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
        page = page.replace(regexs.articleContent, archive.content);
        page = page.replace(regexs.articlePathname, archive.fileName);
        if (callback) return callback(page);
        else return page;
    });
}

module.exports = {
    init: init,
    build: buildViewPage
};