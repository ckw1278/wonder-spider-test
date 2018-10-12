const config = require('@wmp-sbd/config');
const s3 = require('../aws/s3-handler');
const fs = require('fs');

class Ep {
  constructor() {}

  _fields() {
    return ['id', 'title', 'price_pc', 'price_mobile', 'normal_price', 'link', 'mobile_link', 'image_link', 'category_name1', 'category_name2', 'category_name3', 'category_name4', 'brand', 'review_count', 'shipping', 'card_event', 'sale_start', 'sale_end', 'saleCnt', 'update_time'];

  }

  _checkRequiredFields(product) {
    return !!(product.id || product.title || product.salePrice || product.mobileUri || product.imageUri);
  }

  productMap(product) {
    if(this._checkRequiredFields(product)) {
      return {
        id: product.id,
        title: product.title,
        price_pc: product.salePrice,
        price_mobile: product.salePrice,
        normal_price: product.normalPrice,
        link: product.pcUri,
        mobile_link: product.mobileUri,
        image_link: product.imageUri,
        category_name1: product.category1,
        category_name2: product.category2,
        category_name3: product.category3,
        category_name4: product.category4,
        brand: product.brand,
        review_count: product.reviewCount,
        shipping: product.deliveryCharge,
        card_event: product.cardEvent,
        sale_start:product.saleStart, 
        sale_end: product.saleEnd,
        saleCnt: product.saleCount,
        update_time: product.updateTime
      }
    }
  }

  async generateEp(store, epType, products) {
    const fields = this._fields();

    let rows = fields.join('\t') + '\n'; 
    rows += products.map(product => 
      fields.map(key => product[key]).join('\t')
    ).join('\n');

    console.log(rows);
    console.log(`total : ${products.length}`);

    fs.writeFileSync(`${store.hostKey}_${epType}.tsv`, rows);

/*
    const params = {
      Bucket: config.get('s3.bucket'),
      Key: 'etl/' + store.hostKey + '_' + epType + '.tsv',
      Body: rows,
      ContentType: 'text/plain;charset=utf-8',
      ACL: 'public-read'
    };

    await s3.upload(params);
*/
  }
}

module.exports = new Ep();
