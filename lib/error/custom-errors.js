'use strict';

class CustomErrors {
  constructor() {
    this.BadRequestError = require('./custom/bad-request-error');
    this.NotFoundError = require('./custom/not-found-error');
    this.ForbiddenError = require('./custom/forbidden-error');
    this.ConflictError = require('./custom/conflict-error');
  }
}

module.exports = new CustomErrors();