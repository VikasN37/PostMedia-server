const morgan = require('morgan');
const express = require('express');
const postRouter = require('./routes/postRouter');

const app = express();

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Routes
app.use('/api/v1/posts', postRouter);

module.exports = app;
