'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class Otastemall extends Codec {

  eventPath() {
    return '/Promotion';
  }

  eventUriPatterns() {
    return [
      /<a.*?href="javascript:viewCountUp\('(.*?)',.*?'([0-9]+)'\);".*?title="(.*?)">((.|\n)*?)<\/a>/gm
    ];
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["'].*?>/g;
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.uri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const eventSection = $('#mSlide').html();
    const events = [];
    let res;

    for(let ptrn of this.eventUriPatterns()) {
      while((res = ptrn.exec(eventSection))) {
        const imgRes = /<img.*?src=["'](.*?)["']/g.exec(res[4]);

        events.push({event_uri: res[1], title: res[3], image: {url: imgRes[1]}});
      }
    }

    return events;
  }

  async eventMeta(event) {
    return;
  }
}

module.exports = Otastemall;