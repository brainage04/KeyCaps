const express = require("express");
const router = express.Router();

router.get("/", function (request, response) {
	response.redirect(403, "/"); // Forbidden (GET requests forbidden) - redirect to home page
});

const connection = require("../connection");
const bcrypt = require("bcryptjs");

router.post("/login", function(request, response) {
	session = request.session;

	if (session.loggedin) { // If user is logged in
		response.redirect("/"); // Forbidden (user is already logged in) - redirect to home page
		return; // return so code stops running before it encounters another redirect and throws an error
	} else {
		let username = request.body.username;
		let password = request.body.password; // Capture the input fields
	
		if (username && password) { // Ensure the input fields exists and are not empty
			connection.query("SELECT * FROM users WHERE username = ?", [username], function(err, results) {
				if (err) { // If there is an issue with the query, output the error
					console.log(err);
					response.redirect("/"); // Internal Server Error - redirect to home page
					return; // return so code stops running before it encounters another redirect and throws an error
				} else if (results.length > 0) { // If the account exists
					bcrypt.compare(password, results[0].password, function (err, success) {
						if (err) { // If there is an issue with the comparison, output the error
							console.log(err);
							response.redirect("/"); // Internal Server Error - redirect to home page
							return; // return so code stops running before it encounters another redirect and throws an error
						} else if (success) {
							session.loggedin = true;
							session.id = results[0].id;
							session.username = username;
							session.email = results[0].email; // Authenticate the user
			
							response.redirect("/"); // OK (logged in successfully) - redirect to home page
						} else {
							response.send('Incorrect username and/or password.');
						}
					});
				} else {
					response.send('Incorrect username and/or password.');
				}
			});
		} else {
			response.send('Please fill out all fields.');
		}
	}
});

router.post("/register", function(request, response) {
	session = request.session;

	if (session.loggedin) { // If user is logged in
		response.redirect("/"); // Forbidden (user must logout to register another account) - redirect to home page
		return; // return so code stops running before it encounters another redirect and throws an error
	} else {
		let username = request.body.username;
		let password = request.body.password;
		let email = request.body.email; // Capture the input fields
	
		if (username && password && email) { // Ensure the input fields exists and are not empty
			connection.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], function(err, results) { // Execute SQL query that"ll select the account from the database based on the specified username and email
				if (err) { // If there is an issue with the query, output the error
					console.log(err);
					response.redirect("/"); // Internal Server Error - redirect to home page
					return; // return so code stops running before it encounters another redirect and throws an error
				} else if (results.length == 0) { // If the account does not exist
					bcrypt.hash(password, 10, function (err, hash) {
						if (err) { // If there is an issue with the query, output the error
							console.log(err);
							response.redirect("/"); // Internal Server Error - redirect to home page
							return; // return so code stops running before it encounters another redirect and throws an error
						} else {
							connection.query("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, hash, email], function(err) { // Create user
								if (err) { // If there is an issue with the query, output the error
									console.log(err);
									response.redirect("/"); // Internal Server Error - redirect to home page
									return; // return so code stops running before it encounters another redirect and throws an error
								} else {
									response.redirect("/login"); // Redirect to login page to log in to newly made account
								}
							});
						}
					});
				} else {
					response.send('Username and/or email already exists.');
				}
			});
		} else {
			response.send('Please fill out all fields.');
		}
	}
});

module.exports = router;