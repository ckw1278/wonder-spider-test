'use strict';

const Worker = require('./worker');

class Crawler {
  constructor() {
    this.worker = new Worker();
  }

  async run(store) {
    try {
      await this.worker.run(store);

    } catch(err) {
      console.error(`[ERROR] store : ${store.uri}`);
      console.error(err.message || err);
      return [];
    }
  }
}

module.exports = Crawler;
