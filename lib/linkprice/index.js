const requestHelper = require('../requester/request-helper');
const config = require('@wmp-sbd/config');
const CATEGORY_MAPPING = {
  list_recommend: '',
  list_fashion: '패션의류',
  list_book: '도서',
  list_food: '식품'
};


class LinkPrice {
  constructor() {
    this.uri = config.get('linkprice.api.uri');
    this.storesNames = config.get('linkprice.stores');
    this.categorys = ['list_recommend', 'list_fashion', 'list_book', 'list_food'];
  }

  async productDatas() {
    const payload = [];

    this.storesNames.forEach(name => payload.push({store: {ffuid: name}, products: []}));

    const res = await requestHelper.get(this.uri, {});

    if(!res.body) throw new Error('empty product data uri : ' + this.uri);

    const contents = JSON.parse(res.body);

    this.categorys.forEach((category) => {
      payload.forEach((item) => {
        if(contents[category][item.store.ffuid]) {
          const products = this.productMapping(contents, category, item.store.ffuid);

          item.products = item.products.concat(products)};
      });
    });

    this.dataDuplicateInspect(payload);


    return payload;
  }

  dataDuplicateInspect(payload) {
    payload.forEach((item) => {
      const products = [];

      item.products.forEach((itemProduct) => {
        const res = products.find((product) => {return product.storeProductId === itemProduct.storeProductId});

        if(!res) products.push(itemProduct);
      });

      item.products = products;
    });
  }

  productMapping(contents, category, ffuid) {
    const products = contents[category][ffuid];
    const payload = [];

    for(const product of products) {
      const item = {};

      item.storeProductId = product.p_code;
      item.title = product.p_name;
      item.localPrice = {value: product.p_price};
      item.uri = product.target_url;
      item.imageUri = product.img_url;
      item.storeCategoryTop = CATEGORY_MAPPING[category];

      payload.push(item);
    }

    return payload;
  }
}

module.exports = new LinkPrice();