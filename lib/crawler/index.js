'use strict';

const config = require('@wmp-sbd/config');
const defer = require('@wmp-sbd/defer');
const codecFactory = require('./codec');

class Crawler {

  async run() {
    for(const store of config.get('crawling.stores')) {
      if(!store.activated) continue;
      const codec = await codecFactory.create(store);

      await codec.run();
    }
  }

}

module.exports = Crawler;
