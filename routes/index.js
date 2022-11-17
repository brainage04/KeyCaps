var express = require('express');
var router = express.Router();

var title = "Home | BrainSpace";

router.get('/', function (request, response) {
	response.render('index', { title });
});

module.exports = router;