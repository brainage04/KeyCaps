var express = require('express');
var router = express.Router();

router.get('/', function (request, response) {
	session = request.session;
	if (session.loggedin) {
		session.destroy();
		response.redirect('/');
	} else {
		response.send('You are already logged out.');
	}
});

module.exports = router;