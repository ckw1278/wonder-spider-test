'use strict';

/**
 * 국제화를 위해 문자열을 랩핑한다
 * https://www.npmjs.com/package/sprintf-js
 */

const vsprintf = require('../util/sprintf-js-nocache').vsprintf;
const sprintf = require('../util/sprintf-js-nocache').sprintf;

function textWrapper(msg, args) {
  if(typeof args === 'object') {
    return sprintf(msg, args);
  } else {
    return vsprintf(msg, args);
  }
}

module.exports = textWrapper;
