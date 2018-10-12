'use strict';

const fs = require('fs');
const path = require('path');
const defer = require('@wmp-sbd/defer');
const urlHelper = require('../../helper/url-helper');
const Codec = require('./codec');

class CodecFactory {
  constructor() {}

  async create(store) {
    let codec;

    store.hostKey = urlHelper.getHostKeyFromUrl(store.uri);
    const siteCodecPath = `./site/${store.hostKey}.js`;
    const isExist = await this.hasCodec(siteCodecPath);

    if(isExist) {
      const SiteCodec = require(siteCodecPath);

      codec = new SiteCodec(store);

    } else {
      codec = new Codec(store.uri);
    }

    if(global.debug) console.log('Selected HTML Codec : ', codec);

    return codec;
  }

  async hasCodec(modulePath) {
    try {
      await defer(fs, fs.access)(path.resolve(__dirname, modulePath));
      return true;
    } catch(e) {
      return false;
    }
  }
}

module.exports = new CodecFactory();
