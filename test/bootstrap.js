'use strict';

require('../lib/helper/bootstrap');


module.exports = function() {
  /**
   * Define global
   */
  global.expect = require('chai').expect;
  global.should = require('chai').should();

  /**
   * init Chai
   */
  global.chai = require('chai');
  const chaiAsPromised = require('chai-as-promised');
  global.chai.use(chaiAsPromised);

  global.chai.config.truncateThreshold = 0;
  global.chai.config.showDiff = true;

  // 디버그 콘솔 메소드 맵핑
  console.debug = console.log;

} ();