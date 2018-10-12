'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../helper/request-helper');
const epService = require('../../../../lib/ep');
const API_REQUEST_TIME = 3000;

class WeMakePrice extends Codec {

  seedUris(epType) {
    return this.store.epType[epType].uris;
  }

  reviewUri() {
    return this.store.reviewUri;
  }

  productUriPattern() {
    return /http\:\/\/www.wemakeprice.com\/deal\/adeal\/([0-9]+)/gm;
  }

  pcUriPattern() {
    return 'http://www.wemakeprice.com/deal/adeal';
  }

  mobileUriPattern() {
    return 'https://m.wemakeprice.com/m/deal/adeal';
  }

  gnbIdPattern() {
    return /https\:\/\/front.wemakeprice.com\/special\/([\w+]+)/gm;
  }

  checkSoldOut(data) {
    return data.dealMax.soldOut;
  }

  checkAdultProduct(data) {
    return data.categoryInfo.categoryName === '성인용품';
  }

  async fetchReviewCount(productId) {
    let reviewCount;
    try {
      const res = await requestHelper.get(`${this.reviewUri()}/${productId}`)
      reviewCount = JSON.parse(res).result;
    } catch(err) {
      console.log(err);
      reviewCount = 0;
    }

    return reviewCount;
  }

  async collectProductUris(epType) {
    let uris = []

    for(const seedUri of this.seedUris(epType)) {
      const matches = this.gnbIdPattern().exec(seedUri);
      const gnbId = matches && matches[1];
      const apiUrl = `${this.store.api.gnb}&gnbId=${gnbId}`;

      try {
        const res = await requestHelper.get(apiUrl, { timeout: API_REQUEST_TIME });
        const data = JSON.parse(res).data;

        data.deals.map((data) => {
          uris.push(`${this.pcUriPattern()}/${data.linkInfo}`);
        });

      } catch(err) {
        console.log(err);
        continue;
      }
    }

    return uris.filter((v, i, a) => a.indexOf(v) === i);
  }

  _priceInfo($) {
		const normalPrice = $('.price_info .prime .num').text();
    const salePrice = $('.price_info .sale .num').text();
    const deliveryCharge = $('.ot_free_ship').text().trim();

    return {
      normalPrice: normalPrice && normalPrice.replace(/[^0-9]/g, ''),
      salePrice: salePrice && salePrice.replace(/[^0-9]/g, ''),      
      deliveryCharge: deliveryCharge && deliveryCharge === '무료배송' ? 0 : ''
    }
  }

  _categoryInfo($) {
    return {
      category1: $('.select-list-group > a').eq(0).text().trim(),
      category2: $('.select-list-group > a').eq(1).text().trim(),
      category3: $('.select-list-group > a').eq(2).text().trim(),
      category4: $('.select-list-group > a').eq(3).text().trim(),
    }
  }

  async productInfoFromHtml($, uri) {
    try {
      const matches = this.productUriPattern().exec(uri);
      const productId = matches && matches[1];

      const info = {
        id: productId,
        title: $('.deal_tit').text().trim().split('\n')[0],
        pcUri: await this.convertUri(uri),
        mobileUri: await this.convertUri(`${this.mobileUriPattern()}/${productId}`),
        imageUri: $('.img_area .slides_control img').eq(0).attr('src') || $('.img_area .slides_control img').eq(1).attr('src'), 
        saleCount: $('.buy .num').text().replace(/[^0-9]/g, ''),      
        reviewCount: await this.fetchReviewCount(productId),
      }
      return Object.assign(info, this._priceInfo($), this._categoryInfo($));
    } catch(err) {
      console.log(err);
    }

  }

}

module.exports = WeMakePrice;
