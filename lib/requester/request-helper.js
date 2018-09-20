'use strict';

const request = require('request');

class RequestHelper {

  constructor() {}

  get(url, params) {
    return new Promise((resolve, reject) => {
      request.get({url: url, qs: params}, (err, res, body) => {
        if(err) reject(err);
        else resolve(res);
      });
    });
  }

  post(url, data) {
    return new Promise((resolve, reject) => {
      request.post({url: url, body: data, json: true}, (err, res, body) => {
        if(err) reject(err);
        else resolve(res);
      });
    });
  }

  put(url, data) {
    return new Promise((resolve, reject) => {
      request.put({url: url, body: data, json: true}, (err, res, body) => {
        if(err) reject(err);
        else resolve(res);
      });
    });
  }
}

module.exports = new RequestHelper();