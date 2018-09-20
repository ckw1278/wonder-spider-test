'use strict';

const config = require('@wmp-sbd/config');
//const im = require('@wmp-sbd/im');
const defer = require('@wmp-sbd/defer');
const codecFactory = require('../codec');
//const httpHelper = require('../../requester/http-helper');
//const imageHelper = require('../../util/image-helper');

class Worker {
  constructor() {}

  async run(site) {

    const codec = await codecFactory.create(site.hostKey, site.uri);
    const products = await codec.products();

    return products;
  }
}

module.exports = Worker;
