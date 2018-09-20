'use strict';

const CustomError = require('./custom-error');

class ForbiddenError extends CustomError {
  constructor(message, meta) {
    message = message || _t('권한이 없습니다.');

    super(message, meta);

    this.code = 403;
  }
}

module.exports = ForbiddenError;