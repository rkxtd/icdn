const finalhandler = require('finalhandler');
const http = require('http');
const serveStatic = require('serve-static');
const { ImageResizeBuilder } = require('..');
const PUB_FOLDER = 'public'; // no end slash
const SRC_FOLDER = 'src'; // no end slash

// Serve up public/ftp folder
const serve = serveStatic('public', {});

// Create server
const server = http.createServer(function onRequest (req, res) {
    serve(req, res, new ImageResizeBuilder(SRC_FOLDER, PUB_FOLDER)
        .setMiddleware(finalhandler)
        .setReqUrlPath('url')
        .build(req, res));
});

// Listen
server.listen(3000);
