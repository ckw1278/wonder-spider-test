'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class Manyo extends Codec {

  eventPath() {
    return '/shop/goods/event_ing.php';
  }

  eventSectionPatterns() {
    return [
      /<li.*?class="event_item">((.|\n)*?)<\/li>/gm
    ];
  }

  eventUriPatterns() {
    return [
      /<a.*?href="(.*?)".*?>((.|\n)*?)<\/a>/gm
    ];
  }

  imageUrlPattern() {
    return /<img.*?src=["'](.*?)["'].*?>/g;
  }

  async decodeEvents() {
    const doc = await this._openDocument(this.uri);
    const $ = cheerio.load(doc, {decodeEntities: false});
    const eventSection = $('.event_list').html();
    const events = [];
    let res;

    for(let ptrn of this.eventSectionPatterns()) {
      while((res = ptrn.exec(eventSection))) {
        const uriRes = /<a.*?href="(.*?)">/g.exec(res[1]);
        const imgRes = /<img.*?src=["'](.*?)["']/g.exec(res[1]);
        const periodRes = /<p>(.*?)<\/p>/g.exec(res[1]);
        const dates = periodRes[1].split(' ~ ');
        const event = {event_uri: this.origin + uriRes[1], image: {url: this.origin + imgRes[1]}};

        event.start_at = new Date(dates[0]).getTime() / 1000;

        if(/^(19|20)\d{2}\.(0[1-9]|1[012])\.(0[1-9]|[12][0-9]|3[0-1])$/g.test(dates[1])) {
          event.end_at = new Date(dates[1]).getTime() / 1000
        }

        events.push(event);
      }
    }

    return events;
  }

  async eventMeta(event) {
    return;
  }
}

module.exports = Manyo;