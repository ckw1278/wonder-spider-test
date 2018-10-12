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

  async run() {
    for(const epType of this.epTypes()) {
      let products = [];

      for(const uri of await this.collectProductUris(epType)) {
        products.push(await this.decodeProduct(uri));
      }

      await epService.generateEp(this.store, epType, products);
    }
  }

  epTypes() {
    return Object.keys(this.store.epType)
  }

  async productInfoFromHtml($) {
    return null;
  }

  async productInfoFromApi(uri) {
    return null;
  }

  async fetchReviewCount(productId) {
    return 0;
  }

  checkSoldOut() {
    return false;
  }

  checkAdultProduct() {
    return false;
  }

  async collectProductUris(epType) {
    return [];
  }

  async decodeProduct(productUri) {
    const doc = await this._openDocument(productUri);
    const $ = cheerio.load(doc, {decodeEntities: false});

    const infoFromHtml = await this.productInfoFromHtml($, productUri);
    let infoFromApi = {};
    if(this.store.existProductApi) {
      infoFromApi = await this.productInfoFromApi(productUri);
    }

    console.log('----------------------');
    console.log(infoFromHtml);
    console.log('----------------------');

    return epService.productMap(Object.assign(infoFromHtml, infoFromApi));
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
