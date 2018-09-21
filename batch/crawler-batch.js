'use strict';

require('../lib/helper/bootstrap');

const urlHelper = require('../lib/util/url-helper');

const Crawler = require('../lib/crawler');

const Batch = require('../lib/batch');
const batch = new Batch('wonder-event-crawler');
const crawler = new Crawler();

const config = require('@wmp-sbd/config');

const epService = require('../lib/ep');

batch.booking('crawler', '00,20,40 * * * * *', async () => {
  const sites = config.get('crawling.sites');

  for(const site of sites) {
    site.hostKey = urlHelper.getHostKeyFromUrl(site.uri);
    site.products = await crawler.run(site);

    //await epService.generateEp(site.products);
    delete site.hostKey;
  }
});
