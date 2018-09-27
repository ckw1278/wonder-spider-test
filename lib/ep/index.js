const config = require('@wmp-sbd/config');
const s3 = require('../aws/s3-handler');

class Ep {
  constructor() {}

  _checkRequiredFields(product) {
    return !!(product.id || product.title || product.salePrice || product.uri || product.imageUri);
  }

  async generateEp(products) {
    let rows = 'id\ttitle\tprice_pc\tprice_mobile\tnormal_price\tlink\tmobile_link\timage_link\tcategory_name1\tcategory_name2\tcategory_name3\tcategory_name4\tbrand\tmaker\torigin\treview_count\tshipping\tsaleStart\tsaleEnd\tclass\tupdate_time\n';

    for(const [i, product] of products.entries()) {
      if (!this._checkRequiredFields(product)) continue;

      rows += (product.id || '') + '\t';
      rows += (product.title || '') + '\t';
      rows += (product.salePrice || '') + '\t';
      rows += (product.salePrice || '') + '\t';
      rows += (product.normalPrice || '') + '\t';
      rows += (product.uri || '') + '\t';
      rows += (product.uri || '') + '\t';
      rows += (product.imageUri || '') + '\t';
      rows += (product.category1 || '') + '\t';
      rows += (product.category2 || '') + '\t';
      rows += (product.category3 || '') + '\t';
      rows += (product.category4 || '') + '\t';
      rows += '\t';

      console.log('-------------------');
      console.log(rows);
      console.log('-------------------');

      if((products.length - 1) !== i) rows += '\n';
    }

    const params = {
      Bucket: 'cmw-ws',
      Key: 'etl/' + 'd' + '.tsv',
      Body: rows,
      ContentType: 'text/plain;charset=utf-8',
      ACL: 'public-read'
    };

    await s3.upload(params);

/*
    const params = {
      Bucket: config.get('s3.bucket'),
      Key: 'etl/' + store.ffuid + '.tsv',
      Body: rows,
      ContentType: 'text/plain;charset=utf-8',
      ACL: 'public-read'
    };

    await s3.upload(params);
*/
  }
}

module.exports = new Ep();
