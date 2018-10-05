'use strict';

const config = require('@wmp-sbd/config');
const defer = require('@wmp-sbd/defer');
const codecFactory = require('./codec');
const epService = require('../../lib/ep');

class Crawler {
  constructor() {}

  async run() {
    const stores = config.get('crawling.stores');

    for(const store of stores) {
      const codec = await codecFactory.create(store);
      const products = await codec.products();
      await epService.generateEp(store, products);
    }
  }
}

module.exports = Crawler;
