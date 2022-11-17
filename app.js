const path = require('path');
const mysql = require('mysql');
const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config.json');

const indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'static')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (request, response, next) {
	next(createError(404));
});

// error handler
app.use(function (error, request, response, next) {
	// set locals, only providing error in development
	response.locals.message = error.message;
	response.locals.error = request.app.get('env') === 'development' ? error : {};

	// render the error page
	response.status(error.status || 500);
	response.render('error');
});

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : config.MySQLPassword,
	database : 'brainspace'
});

module.exports = app;