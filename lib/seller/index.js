const config = require('@wmp-sbd/config');
const requestHelper = require('../requester/request-helper');

class Seller {
  constructor() {}

  async sellers() {
    const path = '/api/v1/seller/infos';
    const url = config.get('cpc.uri') + path;
    const params = {page: 0, size: 100};

    params['sellerType[]'] = 'SOHOMALL';

    const result = await requestHelper.get(url, params);

    if(!result.body) throw new Error('Empty data url : ' + url);

    const sellers = JSON.parse(result.body);
    let contents = sellers.content;
    let hasNext = sellers.hasNext;

    while(hasNext) {
      params.page++;

      const resultNext = await requestHelper.get(url, params);

      if(!resultNext.body) {
        break;
      }

      const sellersNext = JSON.parse(resultNext.body);

      contents = contents.concat(sellersNext.content);
      hasNext = sellersNext.hasNext;
    }

    return contents;
  }

  async sellersAvailability(seller) {
    const path = '/api/v1/seller/'+ seller.ffuid +'/available';
    const url = config.get('cpc.uri') + path;
    let result = await requestHelper.get(url, {});

    if(!result.body) throw new Error('Empty data url : ' + url);

    result = JSON.parse(result.body);
    seller.isActiveCPC = result.available;
  }
}

module.exports = new Seller();