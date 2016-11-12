'use strict';

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
 * @param {String} fileName
 * @param {any} callback
 * @returns {String} if callback undefined, returns page string
 */
function buildViewPage(fileName, callback) {
    if (!inited) throw new Error('Module ViewPageBuilder haven\'t been inited');
    ArchiveReader.getDetail(fileName, (err, article) => {
        if (err) throw new Error('No such archive.');
        let page = plainViewPage;
        page = page.replace(regexs.arcitleTitle, article.title);
        page = page.replace(regexs.articleContent, article.content);
        page = page.replace(regexs.articleFilename, article.fileName);
        if (callback) return callback(page);
        else return page;
    });
}

module.exports = {
    init: init,
    build: buildViewPage
};