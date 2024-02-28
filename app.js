import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import session from 'express-session';
import passport from 'passport';

import indexRouter from './routes/index.js';
import userRouter from './routes/users.js';
import bookRouter from './routes/book.js';

import passportConfig from './util/auth.js'

const app = express();

app.use(cors(
    {origin: "http://localhost:3000",
        credentials: true,
        sameSite: "None" }
))
// view engine setup
app.set('views', path.join(import.meta.dirname, 'views'));

app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, 'public')));


//session
app.use(session({
    secret: "5BRzdJNfGnoeshNeiiKPLlFfVN72VinVzPFrb9CqXj8T+AV0",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    }
}))

app.use(passport.authenticate("session"));
app.use(passportConfig(passport));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/book', bookRouter);

//404
app.use(function (req, res, next){
    next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


export default app;