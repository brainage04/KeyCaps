const dotenv = require("dotenv");
dotenv.config();

const mysql = require("mysql");

const connection = mysql.createConnection({
	host     : "localhost",
	user     : "root",
	password : process.env.MySQLPassword,
	database : "keycaps"
});

connection.connect(function(err) {
	if (err) {
		console.log(err);
		return;
	} else {
		console.log("Connected to MySQL Database (KeyCaps)");
	}
});

module.exports = connection;