const config = require('@wmp-sbd/config');
const requestHelper = require('../requester/request-helper');

class Store {
  constructor() {}

  async setStores(data) {
    const path = '/store';
    const url = config.get('inch.papi.uri') + path;
    const result = await requestHelper.put(url, data);

    if(result.statusCode !== 200) throw new Error(JSON.stringify(result.body));

    return result.body;
  }

  async stores() {
    const path = '/store';
    const url = config.get('inch.papi.uri') + path;
    const unit = 1000;
    const params = {unit: unit, usePaging: false};

    params['filter[hasFFUID]'] = true;

    const result = await requestHelper.get(url, params);

    if(result.statusCode !== 200) throw new Error(result.body);

    const stores = JSON.parse(result.body);

    let list = stores.list;
    let cursor = stores.cursor;
    let isLast = stores.isLast === undefined ? true : stores.isLast;

    while(!isLast) {
      const nextResult = await requestHelper.get(url, {cursor, unit});
      const nextStores = JSON.parse(nextResult.body);

      list = list.concat(nextStores.list);
      cursor = nextStores.cursor;
      isLast = nextStores.isLast
    }

    return list;
  }

  async storeProducts(store) {
    const path = '/store/' + store.storeId +'/products';
    const url = config.get('inch.papi.uri') + path;
    const unit = 1000;
    const result = await requestHelper.get(url, {unit});

    if(result.statusCode !== 200) throw new Error(result.body);

    const products = JSON.parse(result.body);

    let list = products.list;
    let cursor = products.cursor;
    let isLast = products.isLast;

    while(!isLast) {
      const nextResult = await requestHelper.get(url, {cursor, unit});
      const nextProducts = JSON.parse(nextResult.body);

      list = list.concat(nextProducts.list);
      cursor = nextProducts.cursor;
      isLast = nextProducts.isLast
    }

    return list;
  }
}

module.exports = new Store();