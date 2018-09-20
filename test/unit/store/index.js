'use strict';

require('../../bootstrap');

const storeService = require('../../../lib/store');
let stores;

describe('Store', () => {
  it('스토어 리스트 조회', async () => {
    try {
      const res = await storeService.stores();

      expect(res).to.exist;
      expect(res).to.not.empty;
      stores = res;
    } catch(err) {
      expect(err).to.not.exist;
    }
  });

  it('스토어 별 상품 리스트 조회', async () => {
    try {
      for(const store of stores) {
        const res = await storeService.storeProducts(store);

        expect(res).to.exist;
      }

    } catch(err) {
      expect(err).to.not.exist;
    }
  });
});
