'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../helper/request-helper');
const epService = require('../../../../lib/ep');

class Gmarket extends Codec {

  seedUris() {
    return this.store.epType.hotdeal.uris;
  }

  reviewUri() {
    return this.store.reviewUri;
  }

  productUriPattern() {
    return /http\:\/\/item.gmarket.co.kr\/Item\?goodscode=[0-9]+/gm;
  }

  checkSoldOut($) {
    return $('.price_real').text().trim() == '일시품절';
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

  _extractBrand($, title) {
    let brand = /\[(.*?)\]/.exec(title);
    if(brand) {
      brand = brand[1].trim();
    }

    return brand || $('.table_productinfo').eq(0).find("th:contains('브랜드')").siblings().eq(0).text().trim();
  }

  _priceInfo($) {
		const normalPrice = $('span.price_innerwrap > span.price_original').text() || $('.total_price .before_fee').text();
    const salePrice = $('span.price_innerwrap > strong.price_real').text() || $('.monthly_price').text() || $('.total_price .price').text().trim().split('\n')[1];
    const deliveryCharge = $('li.delivery em.txt_emp').text() || $('li.delivery').text().trim().split('\n')[0];

    return {
      normalPrice: normalPrice && normalPrice.replace(/[^0-9]/g, ''),
      salePrice: salePrice && salePrice.replace(/[^0-9]/g, ''),      
      deliveryCharge: deliveryCharge && deliveryCharge === '무료배송' ? 0 : deliveryCharge.replace(/[^0-9]/g, '')
    }
  }

  _categoryInfo($) {
    return {
      category1: $('.prm_goodstable_header .city').length > 0 ? '여행/항공권' : $('.location-navi > ul > li').eq(1).children('a').text().trim(),
      category2: $('.location-navi > ul > li').eq(2).children('a').text().trim(),
      category3: $('.location-navi > ul > li').eq(3).children('a').text().trim(),
      category4: $('.location-navi > ul > li').eq(4).children('a').text().trim()
    }
  }

  async fetchReviewCount(productId) {
    const reviewCountPattern = /GmktItem.Review.getInstance\(\).reviewTotalCount = (\d+)/;

    let reviewCount;
    try {
      const res = await requestHelper.post(this.reviewUri(), {
        body: { goodsCode: productId }
      });
      reviewCount = res.match(reviewCountPattern)[1];
    } catch(err) {
      reviewCount = 0;
    }

    return reviewCount;
  }

  async productInfoFromHtml($, uri) {
    const productId = uri.split('=')[1];
    const title = $('#itemcase_basic > h1.itemtit').text().trim() || $('.goods_info td').eq(0).text().trim();
    const convertedUri = await this.convertUri(uri);

    const basicInfo = {
      id: productId,
      title: title,
      brand: this._extractBrand($, title),
      pcUri: convertedUri,
      mobileUri: convertedUri,
      imageUri: $('.thumb-gallery img').attr('src') || $('.goods_img img').attr('src'),
      reviewCount: await this.fetchReviewCount(productId),
      cardEvent: $('.card').length > 0 || $('.cardadd').length > 0 ? '카드혜택' : null
    }

    return Object.assign(basicInfo, this._priceInfo($), this._categoryInfo($));
  }

}

module.exports = Gmarket;
