var express = require('express');
var router = express.Router();

var title = "Home";

router.get('/', function (request, response) {
	session = request.session;
	response.render('home', { session, title });
});

module.exports = router;