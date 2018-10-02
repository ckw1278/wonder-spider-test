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
  constructor(uri) {
    this.uri = uri;
  }

  async productInfoFromHtml($) {
    return null;
  }

  checkSoldOut($) {
    return false;
  }

  async _product(uri) {
    const doc = await this._openDocument(uri, 'UTF-8');
    const $ = cheerio.load(doc, {decodeEntities: false});

    if(this.checkSoldOut($)) return;

    const productInfo = await this.productInfoFromHtml($, uri);

    return productInfo;
  }

  async products() {
    const doc = await this._openDocument(this.seedUri());
    const $ = cheerio.load(doc, {decodeEntities: false});
    const body = $.html(); 
    const products = [];
    const uriPtrn = this.productUriPattern();

    for(const uri of body.match(uriPtrn)) {
      products.push(await this._product(uri));
    }
 
    return products;
  }

  async convertUri(uri) {
    const apiUrl = `${config.get('crawling.linkPrice.api.deepLink')}&url=${uri}`;

    let convertedUri;
    try {
      const res = await requestHelper.get(apiUrl);
      const body = JSON.parse(res);
      convertedUri = body.url.trim();
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
