'use strict';

const config = require('@wmp-sbd/config');
const requestHelper = require('../../../../../lib/helper/request-helper');
const GmarketCodec = require('../../../../../lib/crawler/codec/site/gmarket');

describe('Codec', () => {
  describe('Gmarket', () => {
    it('fetch review count', async () => {

      const reviewCountPattern = /GmktItem.Review.getInstance\(\).reviewTotalCount = (\d+)/;
      const requestUrl = 'http://item.gmarket.co.kr/Review';

      try {
        const res = await requestHelper.post(requestUrl, {
          body: { goodsCode: '695050520' }
        });
        const reviewCount = res.match(reviewCountPattern)[1];

        expect(Number(reviewCount)).to.be.a('number');

      } catch(err) {
        expect(err).to.be.undefined;
      }

    });

    it('get product info', async () => {
      try {
        const gmarketCodec = new GmarketCodec();
        const uri = 'http://item.gmarket.co.kr/Item?goodscode=891712831';

        const product = await gmarketCodec._product(uri);

      } catch(err) {
        expect(err).to.be.undefined;
      }
    });

  });
});
