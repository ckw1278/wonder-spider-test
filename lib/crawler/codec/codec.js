'use strict';

const url = require('url');
const cheerio = require('cheerio');
const browser = require('@wmp-sbd/browser');
const requestHelper = require('../../requester/request-helper');
const config = require('@wmp-sbd/config');

const BROWSER_AGENT_MOBILE = 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36';
const BROWSER_AGENT_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';

class Codec {
  constructor(uri) {
    this.uri = uri;
    this.origin = this.getOrigin(uri);

    this.init();
  }

  removeEmptyValue(obj) {
    const payload = {};
    for(const key in obj) {
      if(obj[key] === undefined || obj[key] === null || obj[key] === '' ) continue;
      payload[key] = obj[key];
    }
    return payload;
  }

  async productInfoFromHtml($) {
    return null;
  }

  productInfoFromOgTag(metaTags, productUri) {
    let info = {
      title: metaTags['og:description'],
      imageUri: metaTags['og:image'] ? url.resolve(productUri, metaTags['og:image']) : null
    };

    return this.removeEmptyValue(info);
  }

  checkSoldOut($) {
    return false;
  }

  async product(uri) {
    const doc = await this._openDocument(uri, true);
    const $ = cheerio.load(doc, {decodeEntities: false});

    if(this.checkSoldOut($)) return;

    const infoFromHtml = await this.productInfoFromHtml($, uri);


    console.log('-------------------');
    console.log(infoFromHtml);
    console.log('-------------------');

    return infoFromHtml;
    //const infoFromOgTag = this.productInfoFromOgTag(metaTags, uri);

  }

  async products() {
    const doc = await this._openDocument(this.productsUri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const body = $.html(); 

    const products = [];

    const uriPtrn = this.productUriPattern();
    for(const uri of body.match(uriPtrn)) {
      products.push(await this.product(uri));
    }
 
    return products;
  }

  async polishUri(uri) {
    // 링크프라이스 제공 api로 위메프 매출코드 반영된 딥링크로 변경
    const apiUrl = `${config.get('crawling.linkPrice.api.deepLink')}&url=${uri}`;

    let polishedUri;

    try {
      const res = await requestHelper.get(apiUrl);
      const body = JSON.parse(res['body']);
      polishedUri = body.url;
    } catch(err) {
      polishedUri = uri;
    }

    return polishedUri;
  }

  async _openDocument(uri, skip) {
    let body = await browser.open(uri, 'UTF-8', BROWSER_AGENT_DESKTOP, skip);
    let html = this.documentModifier(body.toString());
    html = this._replaceRelativeUri(html, uri);

    return html;
  }

  _replaceRelativeUri(html, uri) {
    return html.replace(/href=['"]((\?|\.\.\/|\.\/)([^'"\s>]+))/gi, (block, relUri) => {
      return block.replace(relUri, url.resolve(uri, relUri));
    });
  }

  documentModifier(html) {
    return html;
  }

  getOrigin(uri) {
    const res = /(^http:\/\/.*?)\//g.exec(uri);

    return res && res[1];
  }

  init() {}
}

module.exports = Codec;
