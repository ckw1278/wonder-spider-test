'use strict';

const config = require('@wmp-sbd/config');
const requestHelper = require('../../../../lib/helper/request-helper');

describe('Codec', () => {
  it('convert uri', async () => {

    const uri = 'http://item.gmarket.co.kr/Item?goodscode=891712831';
    const apiUrl = `${config.get('crawling.linkPrice.api.deepLink')}&url=${uri}`;

    try {
      const res = await requestHelper.get(apiUrl);
      const body = JSON.parse(res);

      expect(body).to.exist;
      expect(body.result).to.equal('S');

    } catch(err) {
      expect(err).to.be.undefined;
    }

  });
});
