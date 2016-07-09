function log(message) {
	var text = '[' + new Date().toISOString() + ']' + message;
	console.log(text);
}

function logError(message) {
	log('[Error] ' + message);
}

function logWarning(message) {
	log('[Warning] ' + message);
}

function logInfo(message) {
	log('[Info] ' + message);
}

module.exports.error = logError;
module.exports.warning = logWarning;
module.exports.info = logInfo;