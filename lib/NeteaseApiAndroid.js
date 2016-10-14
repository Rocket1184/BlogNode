'use strict';

const qs = require('querystring');
const fs = require('fs');
const http = require('http');
const zlib = require('zlib');

let outputFileName;
let expireTime;
let userId;
let bufJSON = new Array();
let inited = false;
let options = {
    'protocol': 'http:',
    'method': 'POST',
    'hostname': 'music.163.com',
    'path': '/api/batch',
    'headers': {
        'user-agent': 'android',
        'accept-encoding': 'gzip',
        'content-type': 'application/x-www-form-urlencoded',
        'host': 'music.163.com',
        'connection': 'Keep-Alive',
        'cookie': 'MUSIC_A=17d8dda86b092bd628e6efb951d4dc6134f4eee4a3dc5eab6d1d5a05b2290cea3b873d710a9f4ce80af3bb97fd207b7f989e5cca1a78fb6410a30504a6c1324ada80406b02449f800fe035ea4cdbd2c4c3061cd18d77b7a0; deviceId=0; appver=2.0.2; os=android;',
    }
};

/**
 * init module by netease uid and expire time
 * 
 * @param {number} id netease uid
 * @param {number} eTime expire time, second
 */
function init(id, eTime) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[NeteaseAPI] Initialize: id=${id}, eTime=${eTime}`);
    }
    userId = id;
    expireTime = eTime;
    outputFileName = `netease_music_record_${id}.json`;
    inited = true;
    updateData();
}

/** download new list data */
function updateData() {
    if (!inited) throw new Error('NeteaseAPI haven\'t been inited!');

    let output = fs.createWriteStream(outputFileName);

    let req = http.request(options);
    let qString = new Map();
    qString[`/api/user/detail/${userId}`] = '{\'all\':true}';
    req.write(qs.stringify(qString));

    req.on('response', (response) => {
        console.log('[NeteaseAPI] Record data Received.');
        if (process.env.NODE_ENV === 'development') {
            console.log('[NeteaseAPI] Record Response Header: ' + JSON.stringify(response.headers));
        }
        response.pipe(zlib.createGunzip()).pipe(output);
        // wait for async file operation
        output.on('finish', () => {
            fs.readFile(outputFileName, (err, data) => {
                let buf = JSON.parse(data.toString())[`/api/user/detail/${userId}`].listenedSongs;
                bufJSON = new Array();
                buf.forEach((value, index) => {
                    if (index > 9) return;
                    bufJSON.push({ id: value.id, name: value.name, artistName: value.artists[0].name });
                });
            });
        });
    });

    req.on('error', (para) => {
        console.log(`[NeteaseAPI] Error: ${para.message}`);
    });
}

/**
 * get listenedSongs list;
 * callback(string)
 * 
 * @param {function} callback callback(string)
 */
function get(callback) {
    let now = Date.now();
    fs.stat(outputFileName, (err, stats) => {
        if (err || now - stats.mtime > expireTime) {
            updateData();
        }
        callback && callback(JSON.stringify(bufJSON));
    });
}

module.exports = {
    init: init,
    get: get
};