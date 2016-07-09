// Requires
var WebSocketServer = require('ws').Server
var log				= require('./modules/log.js');
var tools			= require('./modules/tools.js');
var lrcreader		= require('./modules/lrcdata-reader.js');
var datahandler		= require('./modules/data-handler.js');

// Start websocket server
var wss = new WebSocketServer({ port: 8080 });

// Clients array
var clients = new Array();

// On new connection
function onConnection(ws) {

	ws.send('Connection accepted');
	log.info('Socket connected');

	// On binary message
	function handleBinaryMessage(message) {

		if (clients[ws] == undefined) {
			log.error('Binary message from unauthorized user. Disconnecting.');
			ws.terminate();
			return;
		}

		var lrcdata = lrcreader.read(message);
		
		if (!lrcdata.ok) {
			log.error('Can\'t parse LRCData');
			return;
		}
		
		datahandler.saveData(clients[ws], lrcdata);
	}

	// On text message
	function handleTextMessage(message) {

		// Get request object
		var request = {};
		try {
			request = JSON.parse(message);
			log.info('[Client] ' + message);
		} catch (ex) {
			log.error('Can\'t parse json from client');
			return;
		}
		
		// Handle request object
		switch (request.name) {
			case 'get-uid':
			var uid = tools.newUID();
			ws.send('uid:' + uid);
			break;
			case 'set-uid':
			var uid = request.data;
			// TODO: Validate UID
			clients[ws] = uid;
			break;
		}
	}

	// On new message
	ws.on('message', function onMessage(message, flags) {

		if (flags.binary) {
			handleBinaryMessage(message);
		} else {
			handleTextMessage(message);
		}

	});

	// On connection close
	ws.on('close', function onClose(code, message) {
		delete clients[ws];
		log.info('Socket disconnected');
	});
}

log.info('Server started');
wss.on('connection', onConnection);