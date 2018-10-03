'use strict';

const rp = require('request-promise');

class RequestHelper {

  constructor() {}

  async get(uri, options={}) {
    try {
      return await rp(Object.assign({method: 'GET', uri: uri}, options));
    } catch(err) {
      console.log(err);
    }
  }

  async post(uri, options={}) {
    try {
      return await rp(Object.assign({method: 'POST', uri: uri, json: true}, options));
    } catch(err) {
      console.log(err);
    }
  }
}

module.exports = new RequestHelper();
