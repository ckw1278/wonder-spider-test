'use strict';

const AWS = require('aws-sdk');
const config = require('@wmp-sbd/config');
const s3 = new AWS.S3({region: config.get('s3.region')});

class S3 {
  upload(params) {
    return new Promise((resolve, reject) => {
      s3.upload(params, function(err, data) {
        if(err) reject(err);
        else resolve(data.Location);
      });
    });
  }
}

module.exports = new S3();