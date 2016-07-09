const mysql     = require('mysql');
const util      = require('util');

// Connect to database
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'lrc'
});
db.connect();

function saveKeyboard(uid, data) {
    for (var i = 0; i < data.length; i++) {

        var process	= data[i].wndInfo.process;
        var title	= data[i].wndInfo.title;
        var time	= data[i].wndInfo.time;

        var query = util.format('INSERT INTO keyboard (uid, process, title, text, event_time) VALUES ("%s", "%s", "%s", "dummy", %d)', uid, process, title, time);

        db.query(query, function(err, rows, fields) {
                
            if (!err) {
                console.log('The solution is: ', rows);
            }
            else{
                console.log(err);
            }

        });
    }
}

function saveClipboard(uid, data) {

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