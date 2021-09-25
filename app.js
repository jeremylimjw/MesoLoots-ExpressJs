var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var cors = require('cors');
var mongoose = require('mongoose');

var authRouter = require('./routes/auth');
var pageRouter = require('./routes/page');
var memberRouter = require('./routes/member');
var lootRouter = require('./routes/loot');

var app = express();

app.use(cors({ origin: ['http://localhost:4200', 'https://jeremylimjw.github.io'], credentials: true }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL)
  .then(() =>  {
    console.log("successfully connected to db.")
  })
  .catch(err => {
    console.error(`error connecting to db: ${err.message}`)
  })

app.use('/api/auth', authRouter);
app.use('/api/page', pageRouter);
app.use('/api/member', memberRouter);
app.use('/api/loot', lootRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
