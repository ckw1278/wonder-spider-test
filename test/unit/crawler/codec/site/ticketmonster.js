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
        const codec = new GmarketCodec();
        const uri = 'http://item.gmarket.co.kr/Item?goodscode=891712831';

        const product = await codec._product(uri);

      } catch(err) {
        expect(err).to.be.undefined;
      }
    });


    it('collect product uri', async () => {
      let uris = []
      const seedUris = ["http://www.ticketmonster.co.kr/planning/PLAN_DCXfbM9PDF", "http://www.ticketmonster.co.kr/planning/PLAN_TKiE6aGegp"]

      for(const seedUri of seedUris) {
        const planId = this.planIdPattern().exec(seedUri)[1];
        const apiUrl = `${this.store.api.dealList}&planId=${planId}`;
        try {
          const res = await requestHelper.get(apiUrl);
          const data = JSON.parse(res).data;
          data.itemList.map((data) => {
            uris.push(`${this.pcUriPattern()}/${data.dealNo}`);
          });

        } catch(err) {
          console.log(err);
          continue;
        }
      }
    });

  });
});
