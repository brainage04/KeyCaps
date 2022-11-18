var express = require('express');
var router = express.Router();

var title = "Home";

router.get('/', function (request, response) {
	response.render('home', { title });
});

module.exports = router;