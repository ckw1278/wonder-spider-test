'use strict';

const url = require('url');
const cheerio = require('cheerio');
const browser = require('@wmp-sbd/browser');
const requestHelper = require('../../helper/request-helper');
const config = require('@wmp-sbd/config');
const epService = require('../../ep');

const BROWSER_AGENT_MOBILE = 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36';
const BROWSER_AGENT_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';

class Codec {
  constructor(store) {
    this.store = store;
  }

  async productInfoFromHtml($) {
    return null;
  }

  checkSoldOut($) {
    return false;
  }

  async products() {
    const productUris = await this.collectProductUris();

    let products = [];
    let i = 0;
    for(const uri of productUris) {
      i++;
      if(i>10) break;
      const pp = await this.decodeProduct(uri);
      console.log(pp);
      console.log('----------------');
      products.push(pp);
    }

    return products;
  }

  async collectProductUris() {
    const ptrn = this.productUriPattern();

    let uris = [];
    for(const seedUri of this.seedUris()) {
      const doc = await this._openDocument(seedUri);
      const $ = cheerio.load(doc, {decodeEntities: false});
      $.html().match(ptrn).map((uri) => {
        uris.push(uri);
      });
    }
    return uris.filter((v, i, a) => a.indexOf(v) === i);
  }

  async decodeProduct(productUri) {
    const doc = await this._openDocument(productUri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const infoFromHtml = await this.productInfoFromHtml($, productUri);

    return epService.productMap(infoFromHtml);
  }

  async convertUri(uri) {
    const apiUrl = `${config.get('crawling.linkPrice.api.deepLink')}&url=${uri}`;

    let convertedUri;
    try {
      const res = await requestHelper.get(apiUrl);
      const body = JSON.parse(res);

      if(body && body.result === 'S') {
        convertedUri = body.url.trim();
      } else {
        convertedUri = uri.trim();
      }

    } catch(err) {
      convertedUri = uri.trim();
    }

    return convertedUri;
  }

  async _openDocument(uri, forceEncoding) {
    let body = await browser.open(uri, 'UTF-8', BROWSER_AGENT_DESKTOP, forceEncoding);
    let html = this._documentModifier(body.toString());
    html = this._replaceRelativeUri(html, uri);

    return html;
  }

  _replaceRelativeUri(html, uri) {
    return html.replace(/href=['"]((\?|\.\.\/|\.\/)([^'"\s>]+))/gi, (block, relUri) => {
      return block.replace(relUri, url.resolve(uri, relUri));
    });
  }

  _documentModifier(html) {
    return html;
  }
}

module.exports = Codec;
