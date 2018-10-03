'use strict';

const requestHelper = require('../lib/helper/request-helper');

describe('codec',() => {
  describe('convert uri',() => {
    it('change uri check', async () => {
      const apiUrl = "https://api.linkprice.com/ci/service/custom_link_xml?a_id=A100627856&mode=json&http://item.gmarket.co.kr/Item?goodscode=906460603"
      const res = await requestHelper.get(apiUrl);
    });
  });
});

