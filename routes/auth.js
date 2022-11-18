const express = require("express");
const router = express.Router();
const connection = require("../connection");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const sendMail = require('../email/gmail');

router.get("/", function (request, response) {
	response.redirect(403, "/"); // Forbidden (GET requests forbidden) - redirect to home page
});

router.post("/login", function(request, response) {
	let session = request.session;

	if (session.loggedin) { // If user is logged in
		response.redirect("/"); // Forbidden (user is already logged in) - redirect to home page
		return; // return so code stops running before it encounters another redirect and throws an error
	} else {
		const username = request.body.username;
		const password = request.body.password; // Capture the input fields
	
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
							session.emailAddress = results[0].emailAddress; // Authenticate the user
			
							response.redirect("/"); // OK (logged in successfully) - redirect to home page
						} else {
							response.send("Incorrect username and/or password.");
						}
					});
				} else {
					response.send("Incorrect username and/or password.");
				}
			});
		} else {
			response.send("Please fill out all fields.");
		}
	}
});

router.post("/register", function(request, response) {
	let session = request.session;

	if (session.loggedin) { // If user is logged in
		response.redirect("/"); // Forbidden (user must logout to register another account) - redirect to home page
		return; // return so code stops running before it encounters another redirect and throws an error
	} else {
		const username = request.body.username;
		const password = request.body.password;
		const emailAddress = request.body.emailAddress; // Capture the input fields
	
		if (username && password && emailAddress) { // Ensure the input fields exists and are not empty
			connection.query("SELECT id FROM users WHERE username = ? OR email_address = ?", [username, emailAddress], function(err, results) { // Execute SQL query that"ll select the account from the database based on the specified username and email address
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
							const verificationCode = crypto
								.createHash("sha256")
								.update(username + hash + emailAddress)
								.digest("hex");

							connection.query("INSERT INTO users (username, password, email_address, verification_token) VALUES (?, ?, ?, ?)", [username, hash, emailAddress, verificationCode], function(err) { // Create user
								if (err) { // If there is an issue with the query, output the error
									console.log(err);
									response.redirect("/"); // Internal Server Error - redirect to home page
									return; // return so code stops running before it encounters another redirect and throws an error
								} else {
									const emailVerification = async () => {
										return await sendMail({
											to: emailAddress,
											subject: 'Keycaps - Email Address Verification',
											text: `Your verification code is: ${verificationCode}`,
											textEncoding: 'base64'
										});
									};

									emailVerification()
										.then((messageId) => console.log('Message sent successfully:', messageId))
										.catch((err) => console.log(err));

									response.redirect("/auth/verify-email-address"); // Redirect to confirmation page to verify email address
								}
							});
						}
					});
				} else {
					response.send("Username and/or email address already exists.");
				}
			});
		} else {
			response.send("Please fill out all fields.");
		}
	}
});

router.get("/verify-email-address", function(request, response) {
	const session = request.session;
	const title = "Verify Email Address";

	response.render("verify-email-address", { session, title });
});

router.post("/verifying-email-address", function(request, response) {
	let session = request.session;

	if (session.loggedin) { // If user is logged in
		response.redirect("/"); // Forbidden (user must logout to register another account) - redirect to home page
		return; // return so code stops running before it encounters another redirect and throws an error
	} else {
		const verificationToken = request.body.verificationToken; // Capture the input fields

		connection.query("SELECT * FROM users WHERE verification_token = ?", [verificationToken], function(err, results) {
			if (err) { // If there is an issue with the query, output the error
				console.log(err);
				response.redirect("/"); // Internal Server Error - redirect to home page
				return; // return so code stops running before it encounters another redirect and throws an error
			} else if (results.length > 0) { // If the account exists
				session.loggedin = true;
				session.id = results[0].id;
				session.username = results[0].username;
				session.emailAddress = results[0].emailAddress; // Authenticate the user

				connection.query("UPDATE users SET email_verified = TRUE WHERE id = ?", [results[0].id], function(err) {
					if (err) { // If there is an issue with the query, output the error
						console.log(err);
						response.redirect("/"); // Internal Server Error - redirect to home page
						return; // return so code stops running before it encounters another redirect and throws an error
					}
				}); // verify email address - for some reason this doesn't work here but it works in the workbench

				response.redirect("/"); // OK (logged in successfully) - redirect to home page
			} else {
				response.send("Username and/or email address does not exist, or the user has already verified their email address.");
			}
		});
	}
});

module.exports = router;