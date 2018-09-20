'use strict';

require('../bootstrap');

const SellersWorker = require('../../lib/worker/sellers');

describe('Sellers', () => {
  it('worker test', async () => {
    const sellersWorker = new SellersWorker();

    await sellersWorker.run();
  }).timeout(10000);
});
