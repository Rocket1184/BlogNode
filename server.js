'use strict';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const NeteaseApi = require('./NeteaseApiAndroid');

var root = path.resolve('.');

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

var server = http.createServer((request, response) => {
    console.log(`[Rocka Node Server] ${request.method}: ${request.url}`);
    // path name in url
    var pathName = url.parse(request.url).pathname;
    // file path based on operation system
    var filePath = path.join(root, pathName);
    console.log(`[Rocka Node Server] pathName: ${pathName}, filePath: ${filePath}`);
    if (request.method === 'GET') {
        // this is a api request
        if (pathName.indexOf('/api/') >= 0) {
            switch (pathName) {
                case '/api/index-article-list':
                    fs.readdir('./archive', (err, files) => {
                        if (err) {
                            console.log(err);
                        } else {
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify(files));
                        }
                    });
                    break;
                case '/api/music-record':
                    fs.stat(NeteaseApi.fileName(), (err, stats) => {
                        if (!err) {
                            var now = Date.now();
                            if (now - stats.mtime >= 3600 * 1000) {
                                NeteaseApi.updateData((fName) => {
                                    sendMusicRecord(fName, response);
                                });
                            } else {
                                sendMusicRecord(NeteaseApi.fileName(), response);
                            }
                        } else {
                            NeteaseApi.updateData((fName) => {
                                sendMusicRecord(fName, response);
                            });
                        }
                    });
                    break;
                default:
                    break;
            }
        } else {
            // try to find and read local file
            fs.stat(filePath, (err, stats) => {
                // no error occured, read file
                if (!err && stats.isFile()) {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    fs.createReadStream(filePath).pipe(response);
                    // cannot find file, but received index request
                } else if (!err && pathName == '/') {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    fs.createReadStream('./page/index.html').pipe(response);
                    // file not found
                } else if (!err && !stats.isFile()) {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    fs.createReadStream('./page/404.html').pipe(response);
                    // error :(
                } else if (err) {
                    response.writeHead(500);
                    response.end(err.toString());
                }
            });
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