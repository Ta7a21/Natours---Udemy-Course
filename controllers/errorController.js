const app = require('../app');
const appError = require('./../utils/appError');

const handleCastErr = (err) => {
  return new appError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleMongoErr = () => {
  return new appError('An already created tour has the same name', 400);
};

const handleValErr = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  return new appError(errors.join('. '), 400);
};

const handleJsonWebTokenError = () => new appError('Invalid token', 401);

const handleTokenExpiredError = () => new appError('Token Expired', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Since they are operational, they are trusted errors that we can send to the client in detail
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  //err.message = `Cant find ${req.originalUrl} on the server`;
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name };
    if (error.name === 'CastError') error = handleCastErr(error);
    if (error.code === 11000) error = handleMongoErr();
    if (error._message === 'Validation failed') error = handleValErr(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorProd(error, res);
  }
};
