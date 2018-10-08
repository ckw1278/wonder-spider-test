'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../helper/request-helper');
const epService = require('../../../../lib/ep');

class TicketMonster extends Codec {

  seedUris() {
    return this.store.epType.hotdeal.uris;
  }

  reviewUri() {
    return this.store.reviewUri;
  }

  productUriPattern() {
    return /http\:\/\/www.ticketmonster.co.kr\/deal\/([0-9]+)/gm;
  }

  pcUriPattern() {
    return 'http://www.ticketmonster.co.kr/deal';
  }

  planIdPattern() {
    return /http\:\/\/www.ticketmonster.co.kr\/planning\/([\w+]+)/gm;
  }

  checkSoldOut($) {
    return $('.price_real').text().trim() == '일시품절';
  }

  async collectProductUris() {
    let uris = []

    for(const seedUri of this.seedUris()) {
      const planId = this.planIdPattern().exec(seedUri)[1];
      const apiUrl = `${this.store.api.dealList}&planId=${planId}`;
      try {
        const res = await requestHelper.get(apiUrl);
        const data = JSON.parse(res).data;

        data.itemList.map((data) => {
          uris.push(`${this.pcUriPattern()}/${data.dealNo}`);
        });

      } catch(err) {
        console.log(err);
        continue;
      }
    }

    return uris.filter((v, i, a) => a.indexOf(v) === i);
  }

  _priceInfo($) {
		const normalPrice = $('section.wrap_deals_basic .price_info .org').text().trim();
    const salePrice = $('section.wrap_deals_basic .price_info .sell .num').text().trim() || $('#price_info .now_price').text().trim();
    const deliveryCharge = $('#_wrapDeliveryInfo .p1').text().trim();

    return {
      normalPrice: normalPrice && normalPrice.replace(/[^0-9]/g, ''),
      salePrice: salePrice && salePrice.replace(/[^0-9]/g, ''),      
      deliveryCharge: deliveryCharge && deliveryCharge === '무료배송' ? 0 : ''
    }
  }

  _categoryInfo($) {
    return {
      category1: $('.path_nav ._depth1 > a').text().trim() || $('.path_nav .category').eq(0).find('a').text(),
      category2: $('.path_nav ._depth2 > a').text().trim() || $('.path_nav .category').eq(1).find('a').text(),
      category3: $('.path_nav ._depth3 > a').text().trim() || $('.path_nav .category').eq(2).find('a').text(),
      category4: $('.path_nav ._depth4 > a').text().trim() 
    }
  }

  async productInfoFromApi($, uri) {
    const matches = this.productUriPattern().exec(uri);
    const productId = matches[1];

    const apiUrl = `${this.store.api.product}/${productId}`;

    let data = {};
    try {
      const res = await requestHelper.get(apiUrl);
      data = JSON.parse(res).data;
    } catch(err) {
      return {};
    }

    const info = {
      id: productId,
      title: data.titleName,
      brand: data.brandInfo,
      pcUri: await this.convertUri(uri),
      mobileUri: await this.convertUri(data.launchInfo.url),
      normalPrice: data.priceInfo.originalPrice,
      salePrice: data.priceInfo.price,
      deliveryCharge: data.deliveryInfo.deliveryFeePolicy === 'FREE' ? '무료배송' : data.deliveryFee,
      imageUri: data.imageInfo.pc3ColImageUrl,
      reviewCount: data.userPoint.reviewCount,
      cardEvent: data.cardDuplicateDiscountInfos ? '카드혜택' : null,
      saleStart: data.startDate,
      saleEnd: data.endDate 
    }

    return info;
  }

  async productInfoFromHtml($, uri) {
    const matches = this.productUriPattern().exec(uri);
    const productId = matches[1];

    const info = {
      id: productId,
      title: $('section.wrap_deals_basic h1.main').text().trim() || $('.ct_area .tit').text().trim(),
      pcUri: '',
      mobilelUri: '',
      imageUri: $('#_mainDealImage img').attr('src') || $('#main_img img').attr('src'),
      cardEvent: '' 
    }

    return Object.assign(info, this._priceInfo($), this._categoryInfo($));
  }

}

module.exports = TicketMonster;
