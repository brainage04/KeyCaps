var express = require('express');
var router = express.Router();

var title = "Login";

router.get('/', function (request, response) {
	response.render('login', { title });
});

module.exports = router;