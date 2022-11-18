const dotenv = require("dotenv");
dotenv.config();

const mysql = require("mysql");

const connection = mysql.createConnection({
	host     : "localhost",
	user     : "root",
	password : process.env.MySQLPassword,
	database : "brainspace"
});

connection.connect(function(err) {
	if (err) {
		console.log(err);
		return;
	} else {
		console.log("Connected to MySQL Database (BrainSpace)");
	}
});

module.exports = connection;