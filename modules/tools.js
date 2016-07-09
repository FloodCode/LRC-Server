var crypto = require('crypto');

function newUID() {
    var randomString = crypto.randomBytes(256).toString('hex');
    var hash = crypto.createHash('sha256');
    hash.update(randomString);
    return hash.digest('hex');
}

module.exports.newUID = newUID;