const express = require("express");
const router = express.Router();

router.get("/", function (request, response) {
	const session = request.session;
	const title = "Register";
	
	if (session.loggedin) {
		response.send("Please log out to register another account.");
	} else {
		response.render("register", { session, title });
	}
});

module.exports = router;