'use strict';

const CustomError = require('./custom-error');

class NotFoundError extends CustomError {
  constructor(message, meta) {
    message = message || _t('존재하지 않습니다.');

    super(message, meta);

    this.code = 404;
  }
}

module.exports = NotFoundError;