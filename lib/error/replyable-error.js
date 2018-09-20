'use strict';

const util = require('util');

/**
 * 에러의 정보와 함께 Http status code 규약을 따르는 에러 코드와, 응답 포멧(HTML,JSON)에 대한 정보가 담긴 에러 클래스
 * @param code code or error object
 * @param message
 * @param meta
 * @param replyFormat
 * @param correctiveUri
 * @returns {ReplyableError}
 * @constructor
 */
function ReplyableError(code, message, meta, replyFormat, correctiveUri) {
  if(!(this instanceof ReplyableError)) {
    return new ReplyableError(code, message, meta, replyFormat, correctiveUri);
  }

  if(typeof code === 'object') {
    this.code = code.code || 500;
    this.message = code.message;
    this.meta = code.meta;
  } else {
    this.code = code;
    this.message = message;
    this.meta = meta;
    this.replyFormat = replyFormat;
    this.correctiveUri = correctiveUri;
  }

  Error.captureStackTrace(this, this.constructor);
}

util.inherits(ReplyableError, Error);
module.exports = ReplyableError;