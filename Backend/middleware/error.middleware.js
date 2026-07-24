const errorMiddleware = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({success: false, message});
};

export default errorMiddleware;