const { NODE_ENV } = require("../config/env");

function errorHandler(err, req, res, _next) {
  if (res.headersSent) return;

  const status =
    err.status ||
    err.statusCode ||
    (err.name === "ValidationError" ? 400 : undefined) ||
    (err.name === "CastError" ? 400 : undefined) ||
    (err.code === 11000 ? 409 : undefined) ||
    (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError"
      ? 401
      : undefined) ||
    500;

  const payload = {
    message: err.message || "Server error",
  };

  if (NODE_ENV === "development" && err.stack) {
    payload.stack = err.stack;
  }

  if (err.code === 11000 && err.keyValue) {
    payload.fields = err.keyValue;
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;
