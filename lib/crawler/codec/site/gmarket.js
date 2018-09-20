'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../requester/request-helper');

class Gmarket extends Codec {

  init() {
    this.productUri = 'http://corners.gmarket.co.kr/SuperDeals';
  }

  async productInfoFromHtml($) {
    const products = [];
    const uriPtrn = /http\:\/\/item.gmarket.co.kr\/Item\?goodscode=[0-9]+/gm
    const catePtrn = /\'servicename\'\:\s+\'\D+\'/gm

    const items = $('ul.item_list').html();
    let res;

    while((res = uriPtrn.exec(items))) {
      const doc = await this._openDocument(res[0]);

      const $ = cheerio.load(doc, {decodeEntities: false});

      //console.log($.html());

      const deepLink = await this.generateDeepLink(res[0]);

      products.push({
        "id": res[0].split('=')[1],
        "title": $('#itemcase_basic > h1.itemtit').text(),
        "link": deepLink,
        "normalPrice": $('span.price_innerwrap > span.price_original').text(),
        "salePrice": $('span.price_innerwrap > strong.price_real').text(),
        "dcRate": /\d+/.exec($('#itemcase_basic > p.price > strong.sale').text())[0],
        "shipping": $('li.delivery em.txt_emp').text() == '무료배송' ? '0' : '',
        "reviewCount": $('#txtReviewTotalCount').text(),
        "category1": "",
        "category2": "",
        "category3": "",
        "category4": "",
      });
      console.log(JSON.stringify(products));
    }

    return products;

  }

}

module.exports = Gmarket;
