'use strict';

const CustomError = require('./custom-error');

class BadRequestError extends CustomError {
  constructor(message, meta) {
    message = message || _t('잘못된 요청입니다.');

    super(message, meta);

    this.code = 400;
  }
}

module.exports = BadRequestError;