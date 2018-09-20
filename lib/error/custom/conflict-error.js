'use strict';

const CustomError = require('./custom-error');

class ConflictError extends CustomError {
  constructor(message, meta) {
    message = message || _t('이미 등록되어 있습니다.');

    super(message, meta);

    this.code = 409;
  }
}

module.exports = ConflictError;