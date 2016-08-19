'use strict';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const NeteaseApi = require('./NeteaseApiAndroid');

var root = path.resolve('.');
var archiveJSON = new Array();
var plainViewPage;

fs.readFile(path.join(root, '/page/404.html'), (err, data) => {
    var versionRegex = /\$\{process\.versions\.node\}/;
    var nodeVersion = process.versions.node;
    var current404 = data.toString().replace(versionRegex, nodeVersion);
    var page404 = fs.createWriteStream(path.join(root, '/page/current404.html'));
    page404.end(current404, 'utf8');
});

fs.readFile(path.join(root, '/page/view.html'), (err, data) => {
    plainViewPage = data.toString();
});

function updateArchiveList() {
    archiveJSON = new Array();
    var pathName = path.join(root, '/archive');
    fs.readdir(pathName, (err, files) => {
        files.forEach((value, index) => {
            fs.stat(path.join(pathName, value), (err, stat) => {
                fs.readFile(path.join(pathName, value), (err, data) => {
                    archiveJSON.push({ title: value, ctime: stat.ctime, summary: data.toString().substr(0, 10) });
                    archiveJSON.sort((a, b) => {
                        if (a.ctime < b.ctime) return 1;
                        if (a.citme == b.ctime) return 0;
                        return -1;
                    });
                });
            });
        });
    });
}

function sendMusicRecord(fileName, response) {
    fs.readFile(fileName, (err, data) => {
        if (err) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(err.message);
        } else {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(data);
        }
    });
}

NeteaseApi.init(76980626, 4 * 3600 * 1000);

updateArchiveList();

var server = http.createServer((request, response) => {
    console.log(`[Rocka Node Server] ${request.method}: ${request.url}`);
    // path name in url
    var pathName = url.parse(request.url).pathname;
    // file path based on operation system
    var filePath = path.join(root, pathName);
    console.log(`[Rocka Node Server] pathName: ${pathName}, filePath: ${filePath}`);
    console.log(`[Rocka Node Server] Request Header: ${JSON.stringify(request.headers)}`);
    if (request.method === 'GET') {
        // this is a api request
        if (pathName.indexOf('/api/') >= 0) {
            switch (pathName) {
                case '/api/index-article-list':
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(archiveJSON));
                    break;
                case '/api/music-record':
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    NeteaseApi.get((data) => {
                        response.end(data);
                    })
                    break;
                default:
                    break;
            }
        } else if (request.headers['pushstate-ajax']) {
            response.writeHead(200, { 'content-Type': 'text/html' });
            fs.createReadStream(filePath).pipe(response);
        } else {
            if (pathName.indexOf('/archive/') >= 0) {
                var archiveRegex = /archive\/(.+)/;
                var titleRegex = /\$\{archive\.title\}/;
                var contentRegex = /\$\{archive\.content\}/;
                var title = archiveRegex.exec(pathName)[1];
                fs.readFile(path.join(root, pathName), (err, data) => {
                    console.log(title);
                    var page = plainViewPage;
                    var page = page.replace(titleRegex, title);
                    var page = page.replace(contentRegex, data.toString());
                    response.end(page);
                });
            } else {
                // try to find and read local file
                fs.stat(filePath, (err, stats) => {
                    // no error occured, read file
                    if (!err && stats.isFile()) {
                        var extRegex = /\w+\.(\w+)$/;
                        var extName;
                        try {
                            extName = extRegex.exec(pathName)[1];
                        } catch (e) { }
                        var contentType;
                        switch (extName) {
                            case 'css':
                                contentType = 'text/css';
                                break;
                            case 'js':
                                contentType = 'application/x-javascript';
                                break;
                            case 'json':
                                contentType = 'application/json';
                                break;
                            case 'jpg':
                                contentType = 'image/jpeg';
                                break;
                            case 'html':
                                contentType = 'text/html';
                                break;
                            case 'png':
                                contentType = 'image/png';
                                break;
                            default:
                                contentType = 'text/plain';
                                break;
                        }
                        response.writeHead(200, { 'content-Type': contentType });
                        fs.createReadStream(filePath).pipe(response);
                        // cannot find file, but received index request
                    } else if (!err && pathName == '/') {
                        response.writeHead(200, { 'content-Type': 'text/html' });
                        fs.createReadStream('./page/index.html').pipe(response);
                        // file not found
                    } else {
                        response.writeHead(200, { 'content-Type': 'text/html' });
                        fs.createReadStream('./page/current404.html').pipe(response);
                    }
                });
            }
        }
    }
});

// Heroku dynamically assigns your app a port,
// so you can't set the port to a fixed number.
// Heroku adds the port to the env,
// so you can pull it from there.
var serverPort = process.env.PORT || 5000;

server.listen(serverPort);

console.log(`[Rocka Node Server] Running at http://127.0.0.1:${serverPort}/`);