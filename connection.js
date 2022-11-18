const mysql = require('mysql');
const config = require('./config.json');

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : config.MySQLPassword,
	database : 'brainspace'
});

connection.connect(function(err) {
	if (err) throw err;
	console.log("Connected to MySQL Database (BrainSpace)");
});

module.exports = connection;