'use strict';

require('../lib/helper/bootstrap');

const urlHelper = require('../lib/util/url-helper');
const Batch = require('../lib/batch');
const batch = new Batch('product-crawler');
const Crawler = require('../lib/crawler');
const crawler = new Crawler();
const config = require('@wmp-sbd/config');

batch.booking('product-crawler', '* * * * * *', async () => {
  const stores = config.get('crawling.stores');

  for(const store of stores) {
    store.hostKey = urlHelper.getHostKeyFromUrl(store.uri);
    await crawler.run(store);
  }
});
