'use strict';

require('../../bootstrap');

const sellerService = require('../../../lib/seller');
let sellers;

describe('Seller', () => {
  it('업체 리스트 조회', async () => {
    try {
      const res = await sellerService.sellers();

      expect(res).to.exist;
      expect(res).to.not.empty;
      sellers = res;
    } catch(err) {
      expect(err).to.not.exist;
    }
  });

  it('업체 별 available 조회', async () => {
    try {
      for(const seller of sellers) {
        await sellerService.sellersAvailability(seller);
        expect(seller.isActiveCPC).to.exist;
      }
    } catch(err) {
      expect(err).to.not.exist;
    }
  });
});
