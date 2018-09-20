const storeService = require('../store');
const epService = require('../ep');

class EpWorker {
  constructor() {}

  async run() {
    try {
      const stores = await storeService.stores();

      for(const store of stores) {
        const products = await storeService.storeProducts(store);

        await epService.setEnginePage(store, products);
      }

    } catch(err) {
      logger.error(err);
    }
  }
}

module.exports = EpWorker;
