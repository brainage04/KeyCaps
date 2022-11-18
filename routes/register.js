var express = require('express');
var router = express.Router();

var title = "Register";

router.get('/', function (request, response) {
	session = request.session;
	if (session.loggedin) {
		response.send('Please log out to register another account.');
	} else {
		response.render('register', { session, title });
	}
});

module.exports = router;