const AppError = require('./../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // send Operational errors or trusted send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // unknow errors are not required to send the client dont leak programming error to client
    res.status(500).json({
      status: 'Error',
      message: 'Something went wrong'
    });
  }
};

const handleCastErrorDb = error => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateValueDB = error => {
  const value = error.errorResponse.errmsg.match(/"([^"]+)"/)[0];
  const message = `Duplicate value ${value} please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
  const errors = Object.values(error.errors).map(el => el.message);
  const message = `Invalid Input Data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid Json web token, Please login again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token is expired, Please login again', 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(err.name);
    if (err.name === 'CastError') error = handleCastErrorDb(error);
    if (err.code === 11000) error = handleDuplicateValueDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
