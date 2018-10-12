require('../lib/helper/bootstrap');

const Batch = require('../lib/batch');
const batch = new Batch('product-crawler');
const Crawler = require('../lib/crawler');

batch.booking('product-crawler', '50 45 * * * *', async () => {
  await new Crawler().run();
});
