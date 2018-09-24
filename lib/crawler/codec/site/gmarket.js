'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../requester/request-helper');

class Gmarket extends Codec {

  init() {
    this.productsUri = 'http://corners.gmarket.co.kr/SuperDeals';
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

  categorySelector() {
    return '.location-navi > ul > li';
  }

  imageUriSelectors() {
    return ['.thumb-gallery img', '.goods_img img'];
  }

  isSoldOut($) {
    return $('.bg_soldout').length > 0;
  }

  async productInfoFromHtml($, uri) {
    //const aa = $('#txtReviewTotalCount').text();
    const aa = $('h3.tit_detailarea > .num').text();
    console.log('------------------');
    console.log(aa);
    console.log('------------------');

    const deepLink = await this.generateDeepLink(uri);

    const product = {
      id: uri.split('=')[1],
      title: $('#itemcase_basic > h1.itemtit').text() || $('.goods_info td').eq(0).text(),
      link: deepLink || uri,
      image_link: $('.thumb-gallery img').attr('src') || $('.goods_img img').attr('src'),
      normalPrice: $('span.price_innerwrap > span.price_original').text(),
      salePrice: $('span.price_innerwrap > strong.price_real').text() || $('.total_price .price').contents().get(2).nodeValue.trim() || /\d+,\d+/.exec($('.monthly_price').text()),
      //"dcRate": /\d+/.exec($('#itemcase_basic > p.price > strong.sale').text())[0],
      shipping: $('li.delivery em.txt_emp').text() == '무료배송' ? '0' : '',
      reviewCount: $('#txtReviewTotalCount').text(),
      category1: $('.location-navi > ul > li').eq(1).children('a').text().trim(),
      category2: $('.location-navi > ul > li').eq(2).children('a').text().trim(),
      category3: $('.location-navi > ul > li').eq(3).children('a').text().trim(),
      category4: $('.location-navi > ul > li').eq(4).children('a').text().trim()
    }

    return product;
  }

}

module.exports = Gmarket;
