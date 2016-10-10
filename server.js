'use strict';

const https = require('https');
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const NeteaseApi = require('./lib/NeteaseApiAndroid');
const ContentType = require('./lib/HtmlContentType');
const ArchiveReader = require('./lib/ArchiveReader');
const ViewPageBuilder = require('./lib/ViewPageBuilder');
const Config = require('./lib/Config');

const root = path.resolve('.');

let regexs = {
    nodeVersion: /\$\{process\.versions\.node\}/,
    extName: /\w+\.(\w+)$/
};

/**init Current Version 404 page. */
fs.readFile(path.join(root, '/page/404.html'), (err, data) => {
    let ver = process.version;
    let current404 = data.toString().replace(regexs.nodeVersion, ver);
    let page404 = fs.createWriteStream(path.join(root, '/page/current404.html'));
    page404.end(current404, 'utf8');
});

/**init archive view page template */
fs.readFile(path.join(root, '/page/view.html'), (err, data) => {
    ViewPageBuilder.init(data.toString());
});

NeteaseApi.init(76980626, 4 * 3600 * 1000);
ArchiveReader.init(path.resolve(root, 'archive'));
Config.init(path.resolve(root, 'config.json'));

function ServerHandler(request, response) {
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
}

// try if support https
Config.getHttpsOptions((err, opt) => {
    if (!err) {
        let httpsServer = https.createServer(opt, ServerHandler);
        let httpsPort = process.env.HTTPS_PORT || Config.options.server.httpsPort ||8443;
        httpsServer.listen(httpsPort);
        console.log(`[Node Server] HTTPS Server running on https://127.0.0.1:${httpsPort}`);
    }
});

// port number from env
let httpPort = process.env.PORT || 8080;
let server = http.createServer(ServerHandler);

server.listen(httpPort);

console.log(`[Node Server] HTTP Server running on http://127.0.0.1:${httpPort}`);