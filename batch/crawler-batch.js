
require('../lib/helper/bootstrap');

const Batch = require('../lib/batch');
const batch = new Batch('product-crawler');
const Crawler = require('../lib/crawler');

batch.booking('product-crawler', '00 00 * * * *', async () => {
  const crawler = new Crawler();

  await crawler.run();
});
