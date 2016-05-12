var apiServer      = require('./apiServer');
var lessMiddleware = require('less-middleware');
var restify        = require('restify');

var publicDir = 'public';

apiServer.use(lessMiddleware({
	src: publicDir,
	force: false,
	debug: false
}));

apiServer.get(/\//, restify.serveStatic({
	directory: publicDir,
	maxAge: 3600,
	default: 'index.html'
}));