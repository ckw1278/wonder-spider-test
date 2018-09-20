'use strict';

const LoggerFactory = require('@wmp-sbd/logger-factory');
const CronJob = require('cron').CronJob;

module.exports = class Batch {
  constructor(jobGroupName, caputerConsoleLog = true) {
    this.logger = LoggerFactory.create(jobGroupName, 'batch');
    if(caputerConsoleLog) LoggerFactory.captureConsoleLog(this.logger);
  }

  /**
   * 작업 예약
   * @param schedule
   *
   * < crontab 형싱으로 입력 >
   * * * * * * *
   * 1. Seconds: 0-59
   * 2. Minutes: 0-59
   * 3. Hours: 0-23
   * 4. Day of Month: 1-31
   * 5. Months: 0-11
   * 6. Day of Week: 0-6
   *
   * < 사용 가능한 표현식 >
   * Asterisk. E.g. *
   * Ranges. E.g. 1-3,5
   * Steps. E.g. * /2
   *
   * @param func
   */
  booking(jobName, schedule, func) {
    this.logger.info(`Hello ${jobName}, Welcome to the batch hotel. Your have been booked at : ${schedule}`);

    new CronJob(schedule, async () => {
      const timer = new Timer();
      timer.start();

      try {
        this.logger.info(`${jobName} is check in`);
        await func();
      } catch(e) {
        this.logger.error(`${jobName} Error occurred`, {reason: e.toString()});
      }
      this.logger.info(`${jobName} is check out`, {time: timer.end()});
    }, null, true);
  }
};

function Timer() {};
Timer.prototype = {
  start: () => {
    this._time = new Date();
  },
  end: () => {
    return (new Date()) - this._time + 'ms';
  }
};