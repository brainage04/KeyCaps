const path = require('path');
const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
// const cookieParser = require('cookie-parser');

const config = require('./config.json');

const homeRouter = require('./routes/home');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const registerRouter = require('./routes/register');
const authRouter = require('./routes/auth');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // view engine setup

app.use(logger('dev'));
// app.use(cookieParser());

var sessionObject = {
	secret: config.SessionObjectSecret,
	resave: false,
  	saveUninitialized: true,
	cookie: {}
};

if (app.get('env') === 'production') {
	app.set('trust proxy', 1) // trust first proxy
	sessionObject.cookie.secure = true // serve secure cookies
}

app.use(session(sessionObject));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'static')));

app.use('/', homeRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/register', registerRouter);
app.use('/auth', authRouter);

app.use(function (request, response, next) {
	next(createError(404)); // catch 404 and forward to error handler
});

app.use(function (err, request, response, next) { // error handler
	response.locals.message = err.message;
	response.locals.err = request.app.get('env') === 'development' ? err : {}; // set locals, only providing error in development

	response.status(err.status || 500);
	response.render('error'); // render the error page
});

module.exports = app;