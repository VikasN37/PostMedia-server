const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message,
  });
};
const sendErrorProduction = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error ---', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong !',
    });
  }
};

const handleCastErrorDB = (error) => {
  const msg = `Invalid ${error.path} : ${error.value}`;
  return new AppError(400, msg);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const msg = `Invalid input data ${errors.join('. ')}`;
  return new AppError(400, msg);
};

const handleWebTokenError = () =>
  new AppError(401, 'Invalid token. Please login again');

const handleTokenExpirationError = () =>
  new AppError(401, 'Token Expired. Please login again');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleWebTokenError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpirationError();
    }
    sendErrorProduction(error, res);
  }
};
