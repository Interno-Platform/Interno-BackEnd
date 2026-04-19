const createError = (message, statusCode, errors = null) => {
  const error = new Error(message);
  error.status = statusCode;
  if (errors) {
    error.errors = errors;
  }
  return error;
};
module.exports = createError;
