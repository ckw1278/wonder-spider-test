'use strict';

const cheerio = require('cheerio');
const Codec = require('../codec');

class LfMall extends Codec {

  eventPath() {
    return '/p2/display/menu?id=208&etag1=002_A002_E026&etag2=0&etag3=9&etag4=201';
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
    const events = [];
    const eventSection = $('.swipeGroup').html();

    if(eventSection) {
      let res;

      for(let ptrn of this.eventUriPatterns()) {
        while((res = ptrn.exec(eventSection))) {
          const imgRes = /<img.*?src=["'](.*?)["']/g.exec(res[2]);
          const imageUrl = imgRes[1];

          events.push({event_uri: this.origin + res[1], image: {url: imageUrl}});
        }
      }
    }

    return events;
  }

  async eventMeta(event) {
    const doc = await this._openDocument(event.event_uri);

    this.titleMeta(doc, event);
    this.descriptionMeta(doc, event);
    this.periodMeta(doc, event);
  }

  titleMeta(doc, event) {
    const ptrn = /<meta.*property=["']og:title["'].*content=["'](.*?)["'].*?>/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let title = res[1].trim();

    if(title && title.length) event.title = title;
  }

  descriptionMeta(doc, event) {
    const ptrn = /<meta.*property=["']og:description["'].*content=["'](.*)["']/gm;
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    let description = res[1].trim();

    if(description && description.length) event.description = description;
  }

  periodMeta(doc, event) {
    const ptrn = /<span.*?class=["']dates["']>((.|\n)*?)<\/span>/gm
    let res = ptrn.exec(doc);

    if(!res || !res[1]) return;

    const dates = res[1].split('~');
    const start = dates[0].replace(' /', '');
    const end = dates[1].replace(' /', '');

    event.start_at = new Date(start).getTime() / 1000;
    event.end_at = new Date(end).getTime() / 1000;
  }
}

module.exports = LfMall;