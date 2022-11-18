var express = require('express');
var router = express.Router();

router.get('/', function (request, response) {
	response.redirect('/'); // Redirect to home page
});

var connection = require('../connection');

router.post('/login', function(request, response) {
	session = request.session;
	if (session.loggedin) {
		response.send('You are already logged in.');
	}
	let username = request.body.username;
	let password = request.body.password; // Capture the input fields
	if (username && password) { // Ensure the input fields exists and are not empty
		connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(err, results, fields) { // Execute SQL query that'll select the account from the database based on the specified username and password
			if (err) throw err; // If there is an issue with the query, output the error
			if (results.length > 0) { // If the account exists
				session.loggedin = true;
				session.username = username;
				session.email = results[0].email; // Authenticate the user
				response.redirect('/'); // Redirect to home page
			} else {
				response.send('Incorrect username and/or password.');
			}			
			response.end();
		});
	} else {
		response.send('Please fill out all fields');
		response.end();
	}
});

router.post('/register', function(request, response) {
	session = request.session;
	if (session.loggedin) {
		response.send('Please log out to register another account.');
	}
	let username = request.body.username;
	let password = request.body.password;
	let email = request.body.email; // Capture the input fields
	if (username && password && email) { // Ensure the input fields exists and are not empty
		connection.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], function(err, results, fields) { // Execute SQL query that'll select the account from the database based on the specified username and email
			if (err) throw err; // If there is an issue with the query, output the error
			if (results.length == 0) { // If the account does not exist
				connection.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], function(err, results, fields) {
					if (err) throw err; // If there is an issue with the query, output the error
				});
				session.loggedin = true;
				session.username = username; // Authenticate the user
				session.email = email; // Authenticate the user
				response.redirect('/'); // Redirect to home page
			} else {
				response.send('Username and/or email already exists.');
			}			
			response.end();
		});
	} else {
		response.send('Please fill out all fields.');
		response.end();
	}
});

module.exports = router;