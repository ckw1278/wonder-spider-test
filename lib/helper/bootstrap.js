'use strict';

const path = require('path');
module.exports = function() {
  /**
   * Init Env
   */
  if(!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  // 디버그 모드
  global.debug = process.env.DEBUG;

  // DNS 쿼리 풀 크기 설정
  // https://stackoverflow.com/questions/24320578/node-js-get-request-etimedout-esockettimedout/37946324#37946324
  process.env.UV_THREADPOOL_SIZE = 128;

  // Define app root
  global.appRoot = path.resolve(__dirname, '../../');

  /**
   * Init global helpers
   */
  const config = require('@wmp-sbd/config');
  const LoggerFactory = require('@wmp-sbd/logger-factory');
  const AWS = require('aws-sdk');

  global.logger = LoggerFactory.create();
  global._t = require('../localize/text-wrapper');
  global.time = function() { return Math.floor(Date.now()/1000); };
  global._ = require('underscore');
  global.CE = require('../error/custom-errors');

  /**
   * Init AWS Module
   */
  if(process.env.NODE_ENV === 'development') AWS.config.update(config.get('aws'));

  /**
   * UncaughtException handling and logging
   */
  /*const exceptionLogger = LoggerFactory.create('uncaught-exception');
  process.on('uncaughtException', function(err) {
    exceptionLogger.crit('UncaughtException', err);
  });*/
} ();