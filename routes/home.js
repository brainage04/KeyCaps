const express = require("express");
const router = express.Router();

router.get("/", function (request, response) {
	const session = request.session;
	const title = "Home";
	
	response.render("home", { session, title });
});

module.exports = router;