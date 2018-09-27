'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../requester/request-helper');

class Gmarket extends Codec {

  init() {
    this.productsUri = 'http://corners.gmarket.co.kr/SuperDeals';
  }

  seedUri() {
    return 'http://corners.gmarket.co.kr/SuperDeals';
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
/*
  async productsUris() {
    const doc = await this._openDocument(this.productsUri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const uriPtrn = this._productUriPattern();
    const productUris = [];

    let productUri;
    while((productUri = uriPtrn.exec($.html()))) {
      productUris.push(productUri[0]);
    }

    return productUris;
  }
*/
  categorySelector() {
    return '.location-navi > ul > li';
  }

  imageUriSelectors() {
    return ['.thumb-gallery img', '.goods_img img'];
  }

  checkSoldOut($) {
    return $('.bg_soldout').length > 0;
  }

  _priceInfo($, type) {
    switch(type) {
     case 'normal':
        const normalPrice = $('span.price_innerwrap > span.price_original').text() || $('.total_price .before_fee').text();
        return normalPrice.replace(/[^0-9]/g,'');

      case 'sale':
        const salePrice = $('span.price_innerwrap > strong.price_real').text() || $('.monthly_price').text() || $('.total_price .price').clone().children().remove().end().text().trim();
        return salePrice.replace(/[^0-9]/g,'');

      case 'delivery':
        const deliveryCharge = $('li.delivery em.txt_emp').text() == '무료배송' ? '0' : ''
        return deliveryCharge;
    }
  }

  _categoryInfo($) {
    const categories = {
      category1: $('.location-navi > ul > li').eq(1).children('a').text().trim(),
      category2: $('.location-navi > ul > li').eq(2).children('a').text().trim(),
      category3: $('.location-navi > ul > li').eq(3).children('a').text().trim(),
      category4: $('.location-navi > ul > li').eq(4).children('a').text().trim()
    }
    return categories;
  }

  extractBrand(title) {
    const matchedBrand = /\[(.*?)\]/.exec(title);
    return matchedBrand ? matchedBrand[1].trim() : ''
  }

  async fetchReviewCount(productId) {
    const ptrn = /GmktItem.Review.getInstance\(\).reviewTotalCount = (\d+)/
    const apiUrl = 'http://item.gmarket.co.kr/Review';

    let reviewCount;
    try {
      const res = await requestHelper.post(apiUrl, {goodsCode: productId});
      const body = res['body'];
      reviewCount = body.match(ptrn)[1];
    } catch(err) {
      reviewCount = 0;
    }

    return reviewCount;
  }

  async productInfoFromHtml($, uri) {
    const productId = uri.split('=')[1]
    const title = $('#itemcase_basic > h1.itemtit').text() || $('.goods_info td').eq(0).text();
    const brand = this.extractBrand(title);
    const polishedUri = await this.polishUri(uri);
    const reviewCount = await this.fetchReviewCount(productId)
    const categories = this._categoryInfo($);

    //defaultInfo
    //priceInfo
    //categoryInfo

    let product = {
      id: productId,
      title: title,
      brand: brand, 
      uri: polishedUri,
      imageUri: $('.thumb-gallery img').attr('src') || $('.goods_img img').attr('src'),
      normalPrice: this._priceInfo($, 'normal'),
      salePrice: this._priceInfo($, 'sale'),
      deliveryCharge: this._priceInfo($, 'delivery'),
      //"dcRate": /\d+/.exec($('#itemcase_basic > p.price > strong.sale').text())[0],
      reviewCount: reviewCount,
    }

    product = Object.assign(product, categories);

    return product;
  }

}

module.exports = Gmarket;
