'use strict';

class CustomError extends Error {
  constructor(message, meta) {
    super(message);

    this.message = message;
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;