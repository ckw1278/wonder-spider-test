'use strict';

require('../bootstrap');

const LinkPriceWorker = require('../../lib/worker/linkprice');

describe('LinkPriceWorker', () => {
  it('worker test ', async () => {
    try {
      const linkPriceWorker = new LinkPriceWorker();

      await linkPriceWorker.run();
    } catch(err) {
      expect(err).to.not.exist;
    }
  }).timeout(60000);
});
