'use strict';

const Worker = require('./worker');

class Crawler {
  constructor() {
    this.worker = new Worker();
  }

  async run(site) {
    try {
      const products = await this.worker.run(site);

      return products;
    } catch(err) {
      console.error(`[ERROR] site : ${site.uri}`);
      console.error(err.message || err);
      return [];
    }
  }
}

module.exports = Crawler;
