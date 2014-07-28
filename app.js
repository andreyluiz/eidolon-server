var restify = require('restify'),
	mongler = require('./mongler');

var server = restify.createServer({ name: 'eidolon-server' });

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

server.get( {path: '/users', 			version: '0.0.1'}, mongler.findAllUsers);
server.post({path: '/users', 			version: '0.0.1'}, mongler.addUser);
server.del( {path: '/users',			version: '0.0.1'}, mongler.deleteAll)
server.get( {path: '/users/:userid', 	version: '0.0.1'}, mongler.findUser);
server.put( {path: '/users/:userid', 	version: '0.0.1'}, mongler.updateUser);
server.del( {path: '/users/:userid', 	version: '0.0.1'}, mongler.deleteUser);

var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3000);

server.listen(port, host, function() {
   return console.log('%s listening at %s', server.name, server.url);
});