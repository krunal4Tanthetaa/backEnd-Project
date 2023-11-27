const AppError = require('./../utils/appError').default;

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const hardleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const messagee = `Duplicate field value :${value}. Please use another value!`;
  return new AppError(messagee, 400);
};

const hadleValidatirErrorDB = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${error.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => new AppError('Invalid token.please log in again!', 401);

const handleJWTExpiredError = (err) =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
  //  console.log(err)
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //B) RENDERED WEBSITE
    console.error('ERROR -----', err);
    return res.status(err.statusCode).render('error', {
      title: 'Somethin went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // A)Oprational  , trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B)Programming or other unknown error : don't leak error detail
    // 1) Log error
    console.error('ERROR -----', err);
    //  2) Send generit message
    return res.status(500).json({
      status: 'error',
      message: 'Somthing went very wrong!',
    });
  }

  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }

  // Programming or other unknown error : don't leak error detail
  // 1) Log error
  console.error('ERROR -----', err);

  //  2) Send generit message
  return res.status(err.statusCode).render('error', {
    title: 'Somethin went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || "No message";

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = hardleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = hadleValidatirErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    sendErrorProd(err, req, res);
  }
};
//if (process.env.NODE_ENV == 'production')
