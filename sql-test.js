var log		= require('./log.js');

log.error('Hello');

var mysql	= require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'lrc'
});

db.connect();

db.query('SELECT * FROM users', function(err, rows, fields) {
	
  if (!err) {
	  console.log('The solution is: ', rows);
  }
  else{
	  console.log('Error while performing Query.');
  }
	
});

db.end();