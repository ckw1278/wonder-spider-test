'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../requester/request-helper');

class Gmarket extends Codec {

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

  categorySelector() {
    return '.location-navi > ul > li';
  }

  imageUriSelectors() {
    return ['.thumb-gallery img', '.goods_img img'];
  }

  checkSoldOut($) {
    //return $('.bg_soldout').length > 0;
    return $('.price_real').text() == '일시품절';
  }

  _priceInfoSelectors(type) {
    switch(type) {
      case 'normal':
        return ['span.price_innerwrap > span.price_original', '.total_price .before_fee']
      case 'sale':
        return ['span.price_innerwrap > strong.price_real', '.monthly_price', '.total_price .price']
      case 'deliveryCharge':
        return ['li.delivery em.txt_emp'];
    }
  }

  _priceInfo($, type) {

    const priceInfo = {
      normalPrice: $('span.price_innerwrap > span.price_original').text() || $('.total_price .before_fee').text(),
      //salePrice: $('span.price_innerwrap > strong.price_real').text() || $('.monthly_price').text() || $('.total_price .price').clone().children().remove().end().text().trim(),
      salePrice: $('span.price_innerwrap > strong.price_real').text() || $('.monthly_price').text() || String($('.total_price .price').text().trim().split('\n')[1]).replace(/[^0-9]/g,''),
      deliveryCharge: $('li.delivery em.txt_emp').text() == '무료배송' ? '0' : ''
    }
    return priceInfo;
/*
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
*/
  }

  _categoryInfo($) {
    const categoryInfo = {
      category1: $('.prm_goodstable_header .city').length > 0 ? '여행/항공권' : $('.location-navi > ul > li').eq(1).children('a').text().trim(),
      category2: $('.location-navi > ul > li').eq(2).children('a').text().trim(),
      category3: $('.location-navi > ul > li').eq(3).children('a').text().trim(),
      category4: $('.location-navi > ul > li').eq(4).children('a').text().trim()
    }
    return categoryInfo;
  }

  extractBrand($, title) {
    //const matchedBrand = /\[(.*?)\]/.exec(title);
    const matchedBrand = $('.table_productinfo').eq(0).find('th:contains("브랜드")').siblings().eq(0).text();
    //return matchedBrand ? matchedBrand[1].trim() : ''
    return matchedBrand;
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
    //const brand = this.extractBrand(title);
    //const polishedUri = await this.polishUri(uri);
    //const reviewCount = await this.fetchReviewCount(productId)
    //const extraInfo = this._extraInfo($);
    const mainInfo = {
      id: productId,
      title: title,
      brand: this.extractBrand($, title), 
      uri: await this.polishUri(uri),
      imageUri: $('.thumb-gallery img').attr('src') || $('.goods_img img').attr('src'),
      reviewCount: await this.fetchReviewCount(productId),
      cardEvent: $('.cardadd').length > 0 ? 'card benefit' : ''
    }
    const priceInfo = this._priceInfo($);
    const categoryInfo = this._categoryInfo($);

    const productInfo = Object.assign(mainInfo, priceInfo, categoryInfo);

    return productInfo;
  }

}

module.exports = Gmarket;
