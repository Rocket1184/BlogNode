'use strict';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const NeteaseApi = require('./lib/NeteaseApiAndroid');
const ContentType = require('./lib/HtmlContentType');
const ArchiveReader = require('./lib/ArchiveReader');
const ViewPageBuilder = require('./lib/ViewPageBuilder');

const root = path.resolve('.');

let regexs = {
    nodeVersion: /\$\{process\.versions\.node\}/,
    extName: /\w+\.(\w+)$/
}

/**init Current Version 404 page. */
fs.readFile(path.join(root, '/page/404.html'), (err, data) => {
    let ver = process.version;
    let current404 = data.toString().replace(regexs.nodeVersion, ver);
    let page404 = fs.createWriteStream(path.join(root, '/page/current404.html'));
    page404.end(current404, 'utf8');
});

/**init archive view page template */
fs.readFile(path.join(root, '/page/view.html'), (err, data) => {
    ViewPageBuilder.init(data.toString())
});

NeteaseApi.init(76980626, 4 * 3600 * 1000);
ArchiveReader.init(path.resolve(root, 'archive'));

let server = http.createServer((request, response) => {
    console.log(`[Node Server] ${request.method}: ${request.url}`);
    /**path name in url */
    let pathName = url.parse(request.url).pathname;
    /**file path based on operation system*/
    let filePath = path.join(root, pathName);
    /**request fileName / maybe unuseable */
    let fileName = path.basename(filePath);
    console.log(`[Node Server] pathName: ${pathName}, filePath: ${filePath}`);
    if (request.method === 'GET') {
        if (pathName.indexOf('/api/') >= 0) {
            // this is a api request
            switch (pathName) {
                case '/api/archive-list':
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    ArchiveReader.getSummaryList(e => response.end(JSON.stringify(e)));
                    break;
                case '/api/music-record':
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    NeteaseApi.get(data => response.end(data));
                    break;
                default:
                    break;
            }
        } else if (request.headers['pushstate-ajax']) {
            // pjax request
            ArchiveReader.getDetail(fileName, (err, archive) => {
                if (!err) {
                    response.writeHead(200, { 'content-Type': 'text/plain' });
                    response.end(JSON.stringify(archive));
                } else {
                    response.writeHead(404, { 'content-Type': 'text/plain' });
                    response.end(err.message);
                }
            });
        } else {
            // try to find and read local file
            fs.stat(filePath, (err, stats) => {
                // no error occured, read file
                if (!err && stats.isFile()) {
                    if (pathName.indexOf('/archive/') >= 0) {
                        // get archive by url, must render page on server
                        ViewPageBuilder.build(path.join(root, pathName), res => {
                            response.writeHead(200, { 'content-Type': 'text/html' });
                            response.end(res);
                        });
                    } else {
                        // get other resources
                        let extName;
                        try {
                            extName = regexs.extName.exec(pathName)[1];
                        } catch (e) {}
                        response.writeHead(200, { 'content-Type': ContentType.get(extName) });
                        fs.createReadStream(filePath).pipe(response);
                    }
                } else if (!err && pathName == '/') {
                    // cannot find file, but received index request
                    response.writeHead(200, { 'content-Type': 'text/html' });
                    fs.createReadStream('./page/index.html').pipe(response);
                } else {
                    // file not found
                    response.writeHead(404, { 'content-Type': 'text/html' });
                    fs.createReadStream('./page/current404.html').pipe(response);
                }
            });
        }
    }
});

// Heroku dynamically assigns your app a port,
// so you can't set the port to a fixed number.
// Heroku adds the port to the env,
// so you can pull it from there.
let serverPort = process.env.PORT || 8080;

server.listen(serverPort);

console.log(`[Node Server] Running at http://127.0.0.1:${serverPort}/`);