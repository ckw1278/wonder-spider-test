'use strict';

const config = require('@wmp-sbd/config');
const defer = require('@wmp-sbd/defer');
const codecFactory = require('../codec');
const epService = require('../../ep');

class Worker {
  constructor() {}

  async run(store) {
    const codec = await codecFactory.create(store.hostKey, store.uri);
    const products = await codec.products();
    await epService.generateEp(store.products);
  }
}

module.exports = Worker;
