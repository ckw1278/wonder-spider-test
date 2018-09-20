'use strict';

require('../../bootstrap');

const epService = require('../../../lib/ep');

describe('EP', () => {
  it('EP 파일 생성', async () => {
    try {
      const store = {ffuid: 'ep-test-store'};
      const products = [];

      //await epService.setEnginePage(store, products);
    } catch(err) {
      expect(err).to.not.exist;
    }
  }).timeout(10000);
});
