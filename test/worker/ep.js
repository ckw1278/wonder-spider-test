'use strict';

require('../bootstrap');

const EpWorker = require('../../lib/worker/ep');

describe('EnginePage', () => {
  it('worker test ', async () => {
    const epWorker = new EpWorker();

    await epWorker.run();
  }).timeout(60000);
});
