'use strict';

require('../bootstrap');

const AvailabilityWorker = require('../../lib/worker/availability');

describe('Availability', () => {
  it('worker test', async () => {
    const availabilityWorker = new AvailabilityWorker();

    await availabilityWorker.run();
  }).timeout(10000);
});
