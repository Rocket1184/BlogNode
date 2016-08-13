'use strict';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

var root = path.resolve(process.argv[2] || '.');

var server = http.createServer((request, response) => {
    console.log(`[Rocka Node Server] ${request.method}: ${request.url}`);
    var pathName = url.parse(request.url).pathname;
    var filePath = path.join(root, pathName);
    console.log(`pathName: ${pathName}, filePath: ${filePath}`);
    if (request.method === 'GET') {
        if (pathName.indexOf('/api/') >= 0) {
            switch (pathName) {
                case '/api/index-article-list':
                    fs.readdir('./archive', (err, files) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(files);
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify(files));
                        }
                    });
                    break;
                default:
                    break;
            }
        } else {
            fs.stat(filePath, (err, stats) => {
                if (!err && stats.isFile()) {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    fs.createReadStream(filePath).pipe(response);
                } else if (!err && pathName == '/') {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    fs.createReadStream('./page/index.html').pipe(response);
                } else if (!err && !stats.isFile()) {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    fs.createReadStream('./page/404.html').pipe(response);
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