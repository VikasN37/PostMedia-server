const morgan = require('morgan');
const express = require('express');
const AppError = require('./utils/appError');
const globalErrorController = require('./controller/errorController');
const postRouter = require('./routes/postRouter');
const userRouter = require('./routes/userRouter');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
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
