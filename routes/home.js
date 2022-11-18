const express = require("express");
const router = express.Router();

var title = "Home";

router.get("/", function (request, response) {
	session = request.session;
	response.render("home", { session, title });
});

module.exports = router;