'use strict';

const https = require('https');
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const Logger = require('./lib/Logger');
const Config = require('./lib/Config');
const NeteaseApi = require('./lib/NeteaseApiAndroid');
const HttpsOption = require('./lib/HttpsOption');
const IndexBuilder = require('./lib/IndexBuilder');
const HeaderBuilder = require('./lib/HeaderBuilder');
const ArchiveReader = require('./lib/ArchiveReader');
const ViewPageBuilder = require('./lib/ViewPageBuilder');
const RangeFileReader = require('./lib/RangeFileReader');

const root = path.resolve('.');
const logger = new Logger('', 'zh-CN', 'Asia/Shanghai');

let regexs = {
    extName: /\.([\w\d]+?)$/
};

function ServerHandler(request, response) {
    /**path name in url */
    let pathName = url.parse(request.url).pathname;
    /**file path based on operation system*/
    let filePath = path.join(root, pathName);
    /**request fileName / maybe unuseable */
    let fileName = path.basename(filePath);
    if (request.method === 'GET') {
        if (pathName === '/') {
            // get index
            response.writeHead(200, HeaderBuilder.build('html', { cache: false }));
            IndexBuilder.build(data => response.end(data));
            logger.log(`[Router] ${request.method} 200 ${pathName} (Index)`);
        } else if (pathName.indexOf('/api/') === 0) {
            // this is a api request
            switch (pathName) {
                case '/api/archive-list':
                    response.writeHead(200, HeaderBuilder.build('json'));
                    ArchiveReader.getSummaryList(e => response.end(JSON.stringify(e)));
                    break;
                case '/api/music-record':
                    response.writeHead(200, HeaderBuilder.build('json'));
                    NeteaseApi.get(data => response.end(data));
                    break;
                default:
                    response.writeHead(404, HeaderBuilder.build('json'));
                    response.end('{"error": "Invalid Api path."}');
                    break;
            }
            logger.log(`[Router] ${request.method} 200 ${pathName} -> API`);
        } else {
            // try to find and read local file
            fs.stat(filePath, (err, stats) => {
                // no error occured, read file
                if (!err && stats.isFile()) {
                    if (pathName.indexOf('/archive/') >= 0) {
                        if (request.headers['pushstate-ajax']) {
                            // get archive using pjax
                            ArchiveReader.getDetail(fileName, (err, archive) => {
                                if (!err) {
                                    response.writeHead(200, HeaderBuilder.build('json', { length: false, cache: false }));
                                    response.end(JSON.stringify(archive));
                                    logger.log(`[Router] ${request.method} 200 ${pathName} (pjax)`);
                                } else {
                                    response.writeHead(404, HeaderBuilder.build('json', { length: false, cache: false }));
                                    response.end(JSON.stringify({ errCode: 404, msg: err.message }));
                                    logger.log(`[Router] ${request.method} 404 ${pathName} (pjax)`);
                                }
                            });
                        } else {
                            // render view page serverSide
                            ViewPageBuilder.build(fileName, res => {
                                response.writeHead(200, HeaderBuilder.build('html', { stats: stats, length: false, cache: false }));
                                response.end(res);
                                logger.log(`[Router] ${request.method} 200 ${pathName} (Server Page)`);
                            });
                        }
                    } else {
                        // cache for browser
                        if (request.headers['if-modified-since'] == stats.mtime.toUTCString()) {
                            response.writeHead(304, "Not Modified");
                            response.end();
                            logger.log(`[Router] ${request.method} 304 ${pathName}`);
                            return;
                        }
                        // get other resources
                        let extName;
                        try { extName = regexs.extName.exec(pathName)[1]; } catch (e) {}
                        if (request.headers['range']) {
                            // using 'Range' header
                            let rawRange = request.headers['range'];
                            let ranger;
                            let file;
                            try {
                                ranger = RangeFileReader.createRange(rawRange, stats);
                                file = RangeFileReader.stream(filePath, ranger);
                                stats.size = ranger.size();
                                response.writeHead(206, 'Partial Content', HeaderBuilder.build(extName, { stats: stats, range: ranger }));
                                file.pipe(response);
                                logger.log(`[Router] ${request.method} 206 ${pathName} -> ${filePath} (Range:${rawRange})`);
                            } catch (err) {
                                response.writeHead(416, 'Unsupported Range');
                                response.end();
                                logger.log(`[Router] ${request.method} 416 ${pathName} (Unsupported Range:${rawRange})`);
                            }
                        } else {
                            // normal file request
                            response.writeHead(200, HeaderBuilder.build(extName, { stats: stats }));
                            fs.createReadStream(filePath).pipe(response);
                            logger.log(`[Router] ${request.method} 200 ${pathName} -> ${filePath}`);
                        }
                    }
                } else {
                    // file not found
                    response.writeHead(200, HeaderBuilder.build('html', { stats: stats }));
                    fs.createReadStream('./page/current404.html').pipe(response);
                    logger.log(`[Router] ${request.method} 404 ${pathName} ClientIP: ${request.connection.remoteAddress}`);
                }
            });
        }
    }
}

function RedirectHandler(request, response) {
    if (request.headers.host) {
        let fullUrl = request.headers.host + request.url;
        logger.log(`[Redirect] httpUrl: ${fullUrl}`);
        fullUrl = fullUrl.replace(/\:\d+/, `:${global.httpsPort}`);
        response.writeHead(301, { 'Location': `https://${fullUrl}` });
    }
    response.end();
}

Config.get(path.resolve(root, 'config.json'), (err, opt) => {
    if (err) {
        logger.log('Config file parse failed, process terminated.\n', err);
        process.exit(1);
    }
    /**init Current Version 404 page. */
    fs.readFile(opt.resourcePath['404Page'], (err, data) => {
        let ver = process.version;
        let current404 = data.toString().replace('${process.version}', ver);
        let page404 = fs.createWriteStream(path.join(root, '/page/current404.html'));
        page404.end(current404, 'utf8');
    });

    /**init archive view page template */
    fs.readFile(opt.resourcePath['viewPage'], (err, data) => {
        ViewPageBuilder.init(data.toString());
    });

    fs.readFile(opt.resourcePath['indexPage'], (err, data) => {
        IndexBuilder.init(data.toString());
    });

    NeteaseApi.init(opt.addons.netease.uid, opt.addons.netease.expireTime);
    ArchiveReader.init(opt.resourcePath['archive']);

    let server;
    let httpPort = process.env.PORT || opt.server.port || 8080;
    /**if redirect enabled in config */
    if (opt.server.redirectHttpToHttps == true) {
        server = http.createServer(RedirectHandler);
    } else {
        server = http.createServer(ServerHandler);
    }
    server.listen(httpPort);
    logger.log(`[Server] HTTP Server running on http://127.0.0.1:${httpPort}`);

    /**if Https enabled in config */
    if (opt.server.enableHttps === true) {
        HttpsOption.get(opt.httpsOptions, (err, httpsOpt) => {
            if (!err) {
                let httpsServer = https.createServer(httpsOpt, ServerHandler);
                let httpsPort = process.env.HTTPS_PORT || opt.server.httpsPort || 8443;
                global.httpsPort = httpsPort;
                httpsServer.listen(httpsPort);
                logger.log(`[Server] HTTPS Server running on https://127.0.0.1:${httpsPort}`);
            } else {
                logger.log(`[Server] HTTPS not enabled cause ${err.message}`);
            }
        });
    }
});