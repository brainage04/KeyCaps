const express = require("express");
const router = express.Router();
const connection = require("../connection");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const sendMail = require('../email/gmail');

router.get("/", function (request, response) {
	response.redirect("/"); // Forbidden (GET requests forbidden) - redirect to home page
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

		session.emailAddress = request.body.emailAddress; // This will be required when verifying email address
	
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
							crypto.randomBytes(4, function (err, buf) {
								if (err) { // If there is an issue with the query, output the error
									console.log(err);
									response.redirect("/"); // Internal Server Error - redirect to home page
									return; // return so code stops running before it encounters another redirect and throws an error
								} else {
									const dateCreated = Date.now(); // account created now
									const emailVerificationToken = buf.readUInt32BE() % 100000000; // get least significant 8 digits
									const emailVerificationTokenExpiration = dateCreated + 3600000; // token expires in 1 hour

									connection.query("INSERT INTO users (date_created, username, password, email_address, email_verification_token, email_verification_token_expiration) VALUES (?, ?, ?, ?, ?, ?)", [dateCreated, username, hash, emailAddress, emailVerificationToken, emailVerificationTokenExpiration], function(err) { // Create user
										if (err) { // If there is an issue with the query, output the error
											console.log(err);
											response.redirect("/"); // Internal Server Error - redirect to home page
											return; // return so code stops running before it encounters another redirect and throws an error
										} else {
											const emailVerification = async () => {
												return await sendMail({
													to: emailAddress,
													subject: 'KeyCaps - Email Address Verification',
													text: `Your verification code is: ${emailVerificationToken}`,
													textEncoding: 'base64'
												});
											};
		
											emailVerification()
												.then((messageId) => console.log('Email sent successfully:', messageId))
												.catch((err) => console.log(err));
		
											response.redirect("/auth/verify-email-address"); // Redirect to confirmation page to verify email address
										}
									});
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

	if (session.loggedin) { // If user is logged in
		response.redirect("/"); // Forbidden (you cannot be logged in with an unverified account) - redirect to home page
	} else {
		response.render("verify-email-address", { session, title });
	}
});

router.post("/verifying-email-address", function(request, response) {
	let session = request.session;

	if (session.loggedin) { // If user is logged in
		response.redirect("/"); // Forbidden (user must logout to register another account) - redirect to home page
		return; // return so code stops running before it encounters another redirect and throws an error
	} else {
		const emailVerificationToken = request.body.emailVerificationToken; // Capture the input fields
		const currentDate = Date.now();

		connection.query("SELECT id, username FROM users WHERE email_address = ? AND email_verification_token = ? AND email_verification_token_expiration > ?", [session.emailAddress, emailVerificationToken, currentDate], function(err, results) { // check that verification token exists in database and belongs to correct email address
			if (err) { // If there is an issue with the query, output the error
				console.log(err);
				response.redirect("/"); // Internal Server Error - redirect to home page
				return; // return so code stops running before it encounters another redirect and throws an error
			} else if (results.length > 0) { // If the account exists
				session.loggedin = true;
				session.id = results[0].id;
				session.username = results[0].username;
				session.emailAddress = session.emailAddress;
				session.emailVerified = true; // Authenticate the user

				connection.query("UPDATE users SET email_verification_token_expiration = ?, email_verified = TRUE WHERE email_address = ?", [currentDate, session.emailAddress], function(err) {
					if (err) { // If there is an issue with the query, output the error
						console.log(err);
						response.redirect("/"); // Internal Server Error - redirect to home page
						return; // return so code stops running before it encounters another redirect and throws an error
					}
				}); // verify email address - for some reason this doesn't work here but it works in the workbench

				response.redirect("/"); // OK (logged in successfully) - redirect to home page
			} else {
				response.send("Username and/or email address does not exist, email verification token is incorrect/has expired, or the user has already verified their email address.");
			}
		});
	}
});

module.exports = router;