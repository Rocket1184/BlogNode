'use strict';

const qs = require("querystring");
const fs = require('fs');
const http = require("http");
const zlib = require('zlib');

var outputFileName = 'netease_record.json';

var options = {
    "protocol": 'http:',
    "method": "POST",
    "hostname": "music.163.com",
    "path": "/api/batch",
    "headers": {
        "user-agent": "android",
        "accept-encoding": "gzip",
        "content-type": "application/x-www-form-urlencoded",
        "host": "music.163.com",
        "connection": "Keep-Alive",
        "cookie": "MUSIC_A=17d8dda86b092bd628e6efb951d4dc6134f4eee4a3dc5eab6d1d5a05b2290cea3b873d710a9f4ce80af3bb97fd207b7f989e5cca1a78fb6410a30504a6c1324ada80406b02449f800fe035ea4cdbd2c4c3061cd18d77b7a0; deviceId=0; appver=2.0.2; os=android;",
    }
};

function fileName(name) {
    if (name) {
        return outputFileName = name;
    } else return name;
}

function getRecord(callback) {
    var output = fs.createWriteStream(outputFileName);

    var req = http.request(options);

    req.write(qs.stringify({ '/api/user/detail/76980626': '{\'all\':true}' }));

    req.on('response', (response) => {
        console.log('[Netease API] Record Data Received!');
        console.log('[Netease API] Record Response Header: ' + JSON.stringify(response.headers));
        response.pipe(zlib.createGunzip()).pipe(output);
        callback && callback(outputFileName);
    })

    req.on('error', (para) => {
        console.log(`[Netease API] ${para.message}`);
    })

    req.end();

    console.log(`[Netease API] Get Record Request Sent!`);
}

module.exports = {
    fileName: fileName,
    updateData: getRecord
}