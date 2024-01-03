const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const express = require('express');
const globalErrorController = require('./controller/errorController');
const postRouter = require('./routes/postRouter');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appError');

const app = express();

// Global middlewares

// for security headers
app.use(helmet());

//  morgan for logging requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  for reading JSON from body
app.use(express.json());

// for query injection attacks
app.use(mongoSanitize());

// for xss
app.use(xss());

// for parameter pollution
app.use(hpp());

// for rate limiting
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from same IP. Please try again.',
});
app.use('/api', limit);

// Routes
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      404,
      `The url ${req.originalUrl} could not be found on the server`
    )
  );
});

app.use(globalErrorController);
module.exports = app;
