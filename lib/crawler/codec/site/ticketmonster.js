'use strict';

const Codec = require('../codec');
const cheerio = require('cheerio');
const requestHelper = require('../../../helper/request-helper');
const epService = require('../../../../lib/ep');
const config = require('@wmp-sbd/config');

class TicketMonster extends Codec {

  seedUris() {
    const topSeedUri = this.store.epType.hotdeal.uris;
    topSeedUri
  }

  async collectProductUris() {
    const topSeedUri = this.store.epType.hotdeal.uris;
    const doc = await this._openDocument(topSeedUri[0], 'UTF-8');
    const $ = cheerio.load(doc, {decodeEntities: false});

    const categoryIds = $('ul#_categoryList li a').map((i, e) => {
      return $(e).attr('data-no')
    }).get();

    for(const id of categoryIds) {
      const reqUri = `http://www.ticketmonster.co.kr/api/home/direct/v1/tabapi/api/best/dealInfoDeals?platformType=PC_WEB&useHeader=AG&categoryNo=${id}&size=100&useCache=CACHE_S60&_=1538782324578`
      //const doc = await this._openDocument(reqUri, 'UTF-8');
      //const $ = cheerio.load(doc, {decodeEntities: false});
      const res = await requestHelper.get(reqUri);
      const body = JSON.parse(res)
      const data = body.data 

      const uris = data.map(v => v.launchInfo.url);
      console.log('---------------------------');
      console.log(uris);
      console.log('---------------------------');

      const productUris = $('ul#_dealList li a').map((i, e) => {
        const f = $(e).attr('href')
      }).get
    }


    return [];
  }

  productUriPattern() {
    return /http\:\/\/item.gmarket.co.kr\/Item\?goodscode=[0-9]+/gm;
  }

  checkSoldOut($) {
    return $('.price_real').text().trim() == '일시품절';
  }

  async _decodeProduct(uri) {
    const doc = await this._openDocument(uri, 'UTF-8');
    const $ = cheerio.load(doc, {decodeEntities: false});

    if(this.checkSoldOut($)) return;

    return epService.productMap(await this.productInfoFromHtml($, uri));
  }

  async products() {
    let products = [];
    for(const uri of await this.collectProductUris()) {
      try {
        const product = await this._decodeProduct(uri)
        if(product) products.push(product);
      } catch(err) {
        console.log(err);
      }
    }

    return products;
  }

  _extractBrand($, title) {
    let brand = /\[(.*?)\]/.exec(title);
    if(brand) {
      brand = brand[1].trim();
    }
    brand = brand || $('.table_productinfo').eq(0).find("th:contains('브랜드')").siblings().eq(0).text().trim();

    return brand;
  }

  _priceInfo($) {
		const normalPrice = $('span.price_innerwrap > span.price_original').text() || $('.total_price .before_fee').text();
    const salePrice = $('span.price_innerwrap > strong.price_real').text() || $('.monthly_price').text() || $('.total_price .price').text().trim().split('\n')[1];
    const deliveryCharge = $('li.delivery em.txt_emp').text() || $('li.delivery').text().trim().split('\n')[0];

    return {
      normalPrice: normalPrice && normalPrice.replace(/[^0-9]/g, ''),
      salePrice: salePrice.replace(/[^0-9]/g, ''),      
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

  async _fetchReviewCount(productId) {
    const reviewCountPattern = /GmktItem.Review.getInstance\(\).reviewTotalCount = (\d+)/;

    const reviewUri = config.get('crawling.stores').find(store => store['name'] === 'G마켓').reviewUri

    let reviewCount;
    try {
      const res = await requestHelper.post(reviewUri, {
        body: { goodsCode: productId }
      });
      reviewCount = res.match(reviewCountPattern)[1];
    } catch(err) {
      reviewCount = 0;
    }

    return reviewCount;
  }

  async productInfoFromOgMeta() {
  }

  async productInfoFromApi() {
  }

  async productInfoFromHtml($, uri) {
    const productId = uri.split('=')[1];
    const title = $('#itemcase_basic > h1.itemtit').text().trim() || $('.goods_info td').eq(0).text().trim();
    const convertedUri = await this.convertUri(uri);

    const basicInfo = {
      id: productId,
      title: title,
      brand: this._extractBrand($, title),
      linkPc: convertedUri,
      linkMobile: convertedUri,
      uri: await this.convertUri(uri),
      imageUri: $('.thumb-gallery img').attr('src') || $('.goods_img img').attr('src'),
      reviewCount: await this._fetchReviewCount(productId),
      cardEvent: $('.card').length > 0 || $('.cardadd').length > 0 ? '카드혜택' : null
    }

    return Object.assign(basicInfo, this._priceInfo($), this._categoryInfo($));
  }

}

module.exports = TicketMonster;
