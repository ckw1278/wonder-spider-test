'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../helper/request-helper');
const epService = require('../../../../lib/ep');
const API_REQUEST_TIME = 3000;

class TicketMonster extends Codec {

  seedUris(epType) {
    return this.store.epType[epType].uris;
  }

  productUriPattern() {
    return /http\:\/\/www.ticketmonster.co.kr\/deal\/([0-9]+)/gm;
  }

  pcUriPattern() {
    return 'http://www.ticketmonster.co.kr/deal';
  }

  mobileUriPattern() {
    return 'http://mobile.ticketmonster.co.kr/deals';
  }

  planIdPattern() {
    return /http\:\/\/www.ticketmonster.co.kr\/planning\/([\w+]+)/gm;
  }

  checkSoldOut(data) {
    return data.dealMax.soldOut;
  }

  checkAdultProduct(data) {
    return data.categoryInfo.categoryName === '성인용품';
  }

  _extractBrand(title) {
    let brand = /\[(.*?)\]/.exec(title);

    return brand && brand[1].trim();
  }

  async collectProductUris(epType) {
    let uris = []

    for(const seedUri of this.seedUris(epType)) {
      const matches = this.planIdPattern().exec(seedUri);
      const planId = matches && matches[1];
      const apiUrl = `${this.store.api.plan}&planId=${planId}`;
      try {
        const res = await requestHelper.get(apiUrl, { timeout: API_REQUEST_TIME });
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
      category1: $('.path_nav .category').eq(0).children('a').text().trim(),
      category2: $('.path_nav .category').eq(1).children('a').text().trim(),
      category3: $('.path_nav .category').eq(2).children('a').text().trim(),
      category4: $('.path_nav .category').eq(3).children('a').text().trim() 
    }
  }

  async productInfoFromApi(uri) {
    const matches = this.productUriPattern().exec(uri);
    const productId = matches[1];

    const apiUrl = `${this.store.api.product}/${productId}`;

    let data = {};
    try {
      const res = await requestHelper.get(apiUrl);
      data = JSON.parse(res).data;

      if(this.checkSoldOut(data) || this.checkAdultProduct(data)) return {};

    } catch(err) {
      console.log(err);
      return {};
    }

    return {
      id: productId,
      title: data.titleName,
      brand: data.brandInfo && data.brandInfo.brandName,
      pcUri: await this.convertUri(uri),
      mobileUri: await this.convertUri(data.launchInfo.url),
      normalPrice: data.priceInfo.originalPrice,
      salePrice: data.priceInfo.price,
      deliveryCharge: data.deliveryInfo.deliveryFeePolicy === 'FREE' ? '0' : data.deliveryFee,
      imageUri: data.imageInfo.pc3ColImageUrl,
      reviewCount: data.userPoint.reviewCount,
      cardEvent: data.cardDuplicateDiscountInfos ? '카드혜택' : null,
      saleStart: data.startDate,
      saleEnd: data.endDate,
      saleCount: data.dealMax.buyCount,
      updateTime: data.metaData.updateTime
    }
  }

  async productInfoFromHtml($, uri) {
    const matches = this.productUriPattern().exec(uri);
    const productId = matches && matches[1];
    const title = $('section.wrap_deals_basic h1.main').text().trim() || $('.ct_area .tit').text().trim();

    const info = {
      id: productId,
      title: title,
      brand: this._extractBrand(title),
      imageUri: $('#_mainDealImage img').attr('src') || $('#main_img img').attr('src'),
      cardEvent: $('#_cardBenefitButton').length > 0 ? '카드혜택' : null, 
      saleCount: $('#_extInfo .buy').text().replace(/[^0-9]/g, ''),      
    }

    return Object.assign(info, this._priceInfo($), this._categoryInfo($));
  }

}

module.exports = TicketMonster;
