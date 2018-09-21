'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../requester/request-helper');

class Gmarket extends Codec {

  init() {
    this.productUri = 'http://corners.gmarket.co.kr/SuperDeals';
  }

  titleSelectors() {
    return ['#itemcase_basic > h1.itemtit', 'div.goods_info > table > tbody > tr'];
  }

  titleMeta(doc) {
    const ptrn = /<meta.*property=["']og:description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);
    if(!res || !res[1]) return;

    const description = res[1].trim();
    return description;
  }

  productUriPattern() {
    return /http\:\/\/item.gmarket.co.kr\/Item\?goodscode=[0-9]+/gm;
  }

  async productInfoFromHtml($, uri) {
    //const catePtrn = /\'servicename\'\:\s+\'\D+\'/gm

    const deepLink = await this.generateDeepLink(uri);

    const product = {
      "id": uri.split('=')[1],
      "title": $('#itemcase_basic > h1.itemtit').text(),
      "link": deepLink,
      "normalPrice": $('span.price_innerwrap > span.price_original').text(),
      "salePrice": $('span.price_innerwrap > strong.price_real').text(),
      //"dcRate": /\d+/.exec($('#itemcase_basic > p.price > strong.sale').text())[0],
      "shipping": $('li.delivery em.txt_emp').text() == '무료배송' ? '0' : '',
      "reviewCount": $('#txtReviewTotalCount').text(),
      "category1": "",
      "category2": "",
      "category3": "",
      "category4": ""
    }
    console.log('------------------');
    console.log(product);
    console.log('------------------');

    return product;
  }

}

module.exports = Gmarket;