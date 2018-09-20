'use strict';

const request = require('request');

class HttpHelper {

  constructor() {}

  imageLoad(url) {
    return new Promise((resolve, reject) => {
      request({
        url: url,
        followAllRedirects: true,
        encoding: null
      }, (err, res, body) => {
        if(err || res.statusCode >= 400) reject(err);

        resolve(body);
      });
    });
  }
}

module.exports = new HttpHelper();
