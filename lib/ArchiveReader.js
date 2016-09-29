'use strict';

const fs = require('fs');
const path = require('path');

let inited = false;
let archiveFloder;
let regexs = {
    header: /^([.\n]+)==========/,
    title: /Title:(.+)\n/,
    date: /Date:(.+)\n/,
    tags: /Tags:(.+)\n/,
    content: /==========(.+)$/
}

/**
 * all detail and content of all the archives.
 */
let allArchives = new Array();

/**
 * only summary content of archives
 */
let summaryList = new Array();

/**
 * Object Archive
 * 
 * @class Archive
 */
class Archive {
    constructor(fileName, title, date, tags, content, summaryCnt) {
        this.fileName = fileName;
        this.title = title;
        this.date = date;
        this.tags = tags;
        this.content = summaryCnt ? content.substring(0, summaryCnt) : content;
    }
}

function init(path) {
    archiveFloder = path;
    inited = true;
    updateArchiveList();
}


/**
 * parse specificed string into Object Archive
 * 
 * @param {String} fileName
 * @param {String} str content of file/string
 * @param {Boolean} isSummary output all content(fasle or undefined) / summary only(true)
 * @returns
 */
function parseArchive(fileName, str, isSummary) {
    let headerIndex = str.indexOf('==========')
    let header = str.substring(0, headerIndex + 1).trim();
    let title = regexs.title.exec(header)[1].trim();
    let date = regexs.date.exec(header)[1].trim();
    let tags = regexs.tags.exec(header)[1].split(',');
    tags = tags.map(e => e.trim());
    let content = str.substring(headerIndex + 11, str.length);
    let dateObj;
    try {
        dateObj = Date.parse(date);
    } catch (err) {
        throw new Error('Invalid date format.')
    }
    let res;
    if (isSummary) res = new Archive(fileName, title, dateObj, tags, content, 20);
    else res = new Archive(fileName, title, dateObj, tags, content);
    return res;
}

/**
 * readdir and rebuild archive & summary list
 * 
 * @param {any} callback
 */
function updateArchiveList(callback) {
    fs.readdir(archiveFloder, (err, files) => {
        let doneCnt = 0;
        allArchives = new Array();
        summaryList = new Array();
        files.forEach(fileName => {
            let tmpPath = path.resolve(archiveFloder, fileName);
            fs.readFile(tmpPath, (err, data) => {
                let str = data.toString();
                let tmpArchive, tmpArchiveSummary;
                try {
                    tmpArchive = parseArchive(fileName, str);
                    tmpArchiveSummary = parseArchive(fileName, str, true);
                } catch (err) {
                    tmpArchive = new Archive('Error', 'Parse Archive Failed.', Date.now(), ['failed'], 'failed');
                    tmpArchiveSummary = new Archive('Error', 'Parse Archive Failed.', Date.now(), ['failed'], 'failed');
                }
                allArchives.push(tmpArchive);
                summaryList.push(tmpArchiveSummary);
                doneCnt++;
                if (doneCnt == files.length) {
                    summaryList.sort((a, b) => b.date - a.date);
                    callback && callback(summaryList);
                }
            });
        });
    });
}

/**
 * get all archives summary list
 * 
 * @param {any} callback
 */
function getSummaryList(callback) {
    if (!inited) throw new Error('Archive Reader Not inited yet.');
    fs.readdir(archiveFloder, (err, files) => {
        if (files.length > allArchives.length && files.length > summaryList.length) {
            updateArchiveList(() => { callback && callback(summaryList) });
        } else {
            callback && callback(summaryList);
        }
    });
}

/**
 * get all archives list
 * 
 * @param {any} callback
 */
function getArchiveList(callback) {
    if (!inited) throw new Error('Archive Reader Not inited yet.');
    fs.readdir(archiveFloder, (err, files) => {
        if (files.length > allArchives.length && files.length > summaryList.length)
            updateArchiveList();
        callback && callback(allArchives);
    });
}

module.exports = {
    init: init,
    parse: parseArchive,
    get: getSummaryList,
    getAll: getArchiveList,
    update: updateArchiveList
}