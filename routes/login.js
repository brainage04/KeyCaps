const express = require("express");
const router = express.Router();

var title = "Login";

router.get("/", function (request, response) {
	session = request.session;
	if (session.loggedin) {
		response.send("You are already logged in.");
	} else {
		response.render("login", { session, title });
	}
});

module.exports = router;