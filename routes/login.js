const express = require("express");
const router = express.Router();

router.get("/", function (request, response) {
	const session = request.session;
	const title = "Login";
	
	if (session.loggedin) {
		response.send("You are already logged in.");
	} else {
		response.render("login", { session, title });
	}
});

module.exports = router;