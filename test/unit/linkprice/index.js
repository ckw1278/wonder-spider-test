'use strict';

require('../../bootstrap');

const linkPriceService = require('../../../lib/linkprice');

describe('LinkPrice', () => {
  it('product data 조회', async () => {
    try {
      await linkPriceService.productDatas();
    } catch(err) {
      expect(err).to.not.exist;
    }
  }).timeout(10000);
});
